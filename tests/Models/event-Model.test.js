import * as eventModel from '../../Model/event-Model.js';
import pool from '../../db.js';
import redisClient from '../../redis.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

jest.mock('../../redis.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    isOpen: true,
    connect: jest.fn(),
  },
  connectRedis: jest.fn(),
}));



describe('eventModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    const mockEvent = {
      name: 'Test Event',
      description: 'A test event.',
      url: 'http://test.com',
      time: '18:00:00',
      image_url: 'http://image.com',
      date: '2025-12-25',
      location: 'Test Loc',
      organizer: 'Test Org',
      organizer_id: '123',
      genre: 'Comedy'
    };

    it('should return "Event created successfully" on a successful insert', async () => {
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 1,
          ...mockEvent,
          number_of_attendees: 1
        }]
      });

      const result = await eventModel.insert(
        mockEvent.name,
        mockEvent.description,
        mockEvent.url,
        mockEvent.time,
        mockEvent.image_url,
        mockEvent.date,
        mockEvent.location,
        mockEvent.organizer,
        mockEvent.organizer_id,
        mockEvent.genre
      );

      expect(result).toBe('Event created successfully');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO events'),
        [
          mockEvent.name,
          mockEvent.date,
          mockEvent.location,
          mockEvent.description,
          mockEvent.url,
          mockEvent.time,
          mockEvent.image_url,
          mockEvent.organizer,
          1, // number_of_attendees
          mockEvent.organizer_id,
          mockEvent.genre
        ]
      );
    });

    it('should throw "Error creating event" if no rows are inserted', async () => {
      pool.query.mockResolvedValueOnce({
        rowCount: 0
      });

      await expect(eventModel.insert(
        mockEvent.name,
        mockEvent.description,
        mockEvent.url,
        mockEvent.time,
        mockEvent.image_url,
        mockEvent.date,
        mockEvent.location,
        mockEvent.organizer,
        mockEvent.organizer_id,
        mockEvent.genre
      )).rejects.toThrow('Error creating event');
    });

    it('should throw an internal error on database failure', async () => {
      const dbError = new Error('DB insert failure');
      pool.query.mockRejectedValue(dbError);

      await expect(eventModel.insert(
        mockEvent.name,
        mockEvent.description,
        mockEvent.url,
        mockEvent.time,
        mockEvent.image_url,
        mockEvent.date,
        mockEvent.location,
        mockEvent.organizer,
        mockEvent.organizer_id,
        mockEvent.genre
      )).rejects.toThrow(dbError);
    });
  });

  describe('selectAll', () => {
    it('should return a formatted list of events when found', async () => {
      const fakeEvents = [{
        id: 1,
        name: 'Event 1',
        organizer_id: 10
      }, {
        id: 2,
        name: 'Event 2',
        organizer_id: 20
      }, ];
      pool.query.mockResolvedValueOnce({
        rows: fakeEvents
      });

      const expected = fakeEvents.map(event => ({
        ...event,
        id: event.id.toString(),
        organizer_id: event.organizer_id.toString(),
      }));

      const result = await eventModel.selectAll({
        limitPlusOne: 11,
        offset: 0
      });
      expect(result).toEqual(expected);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2', [11, 0]
      );
    });

    it('should return "No events found" if no events are returned', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await eventModel.selectAll({
        limitPlusOne: 11,
        offset: 0
      });
      expect(result).toBe('No events found');
    });

    it('should throw an internal error on database failure', async () => {
      const dbError = new Error('DB selectAll failure');
      pool.query.mockRejectedValue(dbError);

      await expect(eventModel.selectAll({
        limitPlusOne: 11,
        offset: 0
      })).rejects.toThrow(dbError);
    });
  });

  describe('selectById', () => {
    it('should return a formatted event when found', async () => {
      const fakeEvent = {
        id: 1,
        name: 'Specific Event',
        organizer_id: 55,
      };
      pool.query.mockResolvedValueOnce({
        rows: [fakeEvent]
      });

      const expected = {
        ...fakeEvent,
        id: fakeEvent.id.toString(),
        organizer_id: fakeEvent.organizer_id.toString(),
      };

      const result = await eventModel.selectById({
        id: 1
      });
      expect(result).toEqual(expected);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM events WHERE id = $1', [1]);
    });

    it('should return "Event not found" if no event is returned', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await eventModel.selectById({
        id: 999
      });
      expect(result).toBe('Event not found');
    });

    it('should throw an internal error on database failure', async () => {
      const dbError = new Error('DB selectById failure');
      pool.query.mockRejectedValue(dbError);

      await expect(eventModel.selectById({
        id: 1
      })).rejects.toThrow(dbError);
    });
  });

  describe('update', () => {
    it('should return the updated event object on a successful update', async () => {
      const updatedEvent = {
        id: 1,
        name: 'Updated Event',
        date: '2025-12-26',
        location: 'New Loc'
      };
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [updatedEvent]
      });

      const result = await eventModel.update(1, {
        name: 'Updated Event',
        date: '2025-12-26',
        location: 'New Loc'
      });
      expect(result).toEqual(updatedEvent);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE events\s+SET name = \$1, date = \$2, location = \$3\s+WHERE id = \$4\s+RETURNING \*/),
        ['Updated Event', '2025-12-26', 'New Loc', 1]
      );
    });

    it('should return "Event not found" if no row is updated', async () => {
      pool.query.mockResolvedValueOnce({
        rowCount: 0
      });

      const result = await eventModel.update(999, {
        name: 'Updated Event',
        date: '2025-12-26',
        location: 'New Loc'
      });
      expect(result).toBe('Event not found');
    });

    it('should throw an internal error on database failure', async () => {
      const dbError = new Error('DB update failure');
      pool.query.mockRejectedValue(dbError);

      await expect(eventModel.update(1, {
        name: 'Updated Event',
        date: '2025-12-26',
        location: 'New Loc'
      })).rejects.toThrow(dbError);
    });
  });

  describe('searchEvents', () => {
    const searchQuery = 'Dani Diaz';
    const cacheKey = `events_search:${searchQuery.toLowerCase()}`;
    const fakeEvents = [
      { id: 1, name: 'Dani Diaz Live Show', organizer: 'TechOrg' }
    ];

    it('should return cached results if Redis has the data', async () => {
      redisClient.get.mockResolvedValueOnce(JSON.stringify(fakeEvents));

      const result = await eventModel.searchEvents(searchQuery);

      expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(fakeEvents);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should query Postgres and cache the result if Redis is empty', async () => {
      redisClient.get.mockResolvedValueOnce(null); // Cache miss
      pool.query.mockResolvedValueOnce({ rows: fakeEvents });

      const result = await eventModel.searchEvents(searchQuery);

      expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT *'),
        [`%${searchQuery}%`]
      );
      expect(redisClient.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(fakeEvents),
        { EX: 3600 }
      );
      expect(result).toEqual(fakeEvents);
    });

    it('should return an empty array if no results are found in Postgres', async () => {
      redisClient.get.mockResolvedValueOnce(null); // Cache miss
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await eventModel.searchEvents(searchQuery);

      expect(result).toEqual([]);
      expect(redisClient.set).not.toHaveBeenCalled();
    });

    it('should throw an error if Postgres query fails', async () => {
      redisClient.get.mockResolvedValueOnce(null);
      pool.query.mockRejectedValueOnce(new Error('DB fail'));

      await expect(eventModel.searchEvents(searchQuery))
        .rejects
        .toThrow('DB fail');
    });
  });
});
