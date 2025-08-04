import * as eventModel from '../../Model/event-Model.js';
import pool from '../../db.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

describe('eventModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should return "Event created successfully" on successful insert', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name: 'Test Event', date: '2025-12-25', location: 'Test Loc' }] });

      const result = await eventModel.insert({ name: 'Test Event', date: '2025-12-25', location: 'Test Loc' });
      expect(result).toBe('Event created successfully');
    });

    it('should throw "Error creating event" if no rows inserted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(eventModel.insert({ name: 'Test Event', date: '2025-12-25', location: 'Test Loc' }))
        .rejects
        .toThrow('Error creating event');
    });

    it('should throw internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB insert failure'));

      await expect(eventModel.insert({ name: 'Test Event', date: '2025-12-25', location: 'Test Loc' }))
        .rejects
        .toThrow('DB insert failure');
    });
  });

  describe('selectAll', () => {
    it('should return events when found', async () => {
      const fakeEvents = [
        { id: 1, name: 'Event 1', organizer_id: 10 },
        { id: 2, name: 'Event 2', organizer_id: 20 },
      ];

      pool.query.mockResolvedValueOnce({ rows: fakeEvents });

      const expected = fakeEvents.map(event => ({
        ...event,
        id: event.id.toString(),
        organizer_id: event.organizer_id.toString(),
      }));

      const result = await eventModel.selectAll({ limitPlusOne: 11, offset: 0 });
      expect(result).toEqual(expected);
    });


    it('should throw "No events found" if none found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(eventModel.selectAll({ limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow('No events found');
    });


    it('should throw internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB selectAll failure'));

      await expect(eventModel.selectAll({ limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow('DB selectAll failure');
    });
  });

  describe('selectById', () => {
    it('should return an event when found', async () => {
      const fakeEvent = {
        id: 1,
        name: 'Specific Event',
        organizer_id: 55, // include this if your real event has it
      };

      pool.query.mockResolvedValueOnce({ rows: [fakeEvent] });

      const expected = {
        ...fakeEvent,
        id: fakeEvent.id.toString(),
        organizer_id: fakeEvent.organizer_id?.toString() ?? null,
      };

      const result = await eventModel.selectById({ id: 1 });
      expect(result).toEqual(expected);
});


    it('should throw "Event not found" if no event found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(eventModel.selectById({ id: 999 }))
        .rejects
        .toThrow('Event not found');
    });

    it('should throw internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB selectById failure'));

      await expect(eventModel.selectById({ id: 1 }))
        .rejects
        .toThrow('DB selectById failure');
    });
  });

describe('update', () => {
    it('should return the updated event object on successful update', async () => {
      const updatedEvent = { id: 1, name: 'Updated Event', date: '2025-12-26', location: 'New Loc' };
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [updatedEvent] });

      const result = await eventModel.update(1, { name: 'Updated Event', date: '2025-12-26', location: 'New Loc' });
      expect(result).toEqual(updatedEvent);
    });

    it('should throw "Event not found" if no row updated', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(eventModel.update(999, { name: 'Updated Event', date: '2025-12-26', location: 'New Loc' }))
        .rejects
        .toThrow('Event not found');
    });

    it('should throw internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB update failure'));

      await expect(eventModel.update(1, { name: 'Updated Event', date: '2025-12-26', location: 'New Loc' }))
        .rejects
        .toThrow('DB update failure');
    });
  });

  describe('remove', () => {
    it('should return "Event deleted successfully" on successful deletion', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await eventModel.remove({ id: 1 });
      expect(result).toBe('Event deleted successfully');
    });

    it('should throw "Event not found" if no row deleted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(eventModel.remove({ id: 999 }))
        .rejects
        .toThrow('Event not found');
    });

    it('should throw internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB remove failure'));

      await expect(eventModel.remove({ id: 1 }))
        .rejects
        .toThrow('DB remove failure');
    });
  });
});