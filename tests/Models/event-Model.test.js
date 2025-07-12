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
    it('should return success message on successful insert', async () => {
      pool.query.mockResolvedValue({ rowCount: 1, rows: [{}] });

      const params = {
        name: 'Event 1',
        description: 'Desc',
        url: 'http://example.com',
        location: 'Loc',
        time: '12:00',
        date: '2025-07-05',
        organizer: 'Org',
        imageurl: 'http://image.com/img.png',
        numberofattendees: 100,
        organizerid: 1,
      };

      const result = await eventModel.insert(params);
      expect(result).toBe('Event created successfully');
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
    });

    it('should return error message if no rows inserted', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await eventModel.insert({});
      expect(result).toBe('Error creating event');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB failure'));

      const result = await eventModel.insert({});
      expect(result).toBe('Internal server error');
    });
  });

  describe('selectAll', () => {
    it('should return events array when found', async () => {
      const fakeRows = [{ id: 1 }, { id: 2 }];
      pool.query.mockResolvedValue({ rows: fakeRows });

      const result = await eventModel.selectAll({
        limitPlusOne: 11,
        offset: 0
    });
      expect(result).toEqual(fakeRows);
    });

    it('should return "No events found" if no rows', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await eventModel.selectAll({ limitPlusOne: 11, offset: 0 });
      expect(result).toBe('No events found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      await expect(eventModel.selectAll({ limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow('Internal server error');
    });

  });

  describe('selectById', () => {
    it('should return event rows if found', async () => {
      const fakeRows = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows: fakeRows });

      const result = await eventModel.selectById({ id: 1 });
      expect(result).toEqual(fakeRows);
    });

    it('should return "Event not found" if no rows', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await eventModel.selectById({ id: 999 });
      expect(result).toBe('Event not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      const result = await eventModel.selectById({ id: 1 });
      expect(result).toBe('Internal server error');
    });
  });

  describe('update', () => {
    it('should return success message if row updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const params = {
        id: 1,
        name: 'Updated',
        description: 'Desc',
        url: 'http://url.com',
        location: 'Loc',
        time: '13:00',
        date: '2025-07-06',
        organizer: 'Org',
        imageurl: 'http://img.com',
        numberofattendees: 50,
        organizerid: 2,
      };

      const result = await eventModel.update(params);
      expect(result).toBe('Event updated successfully');
    });

    it('should return "Event not found" if no row updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await eventModel.update({ id: 999 });
      expect(result).toBe('Event not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      const result = await eventModel.update({ id: 1 });
      expect(result).toBe('Internal server error');
    });
  });

  describe('remove', () => {
    it('should return success message if row deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await eventModel.remove({ id: 1 });
      expect(result).toBe('Event deleted successfully');
    });

    it('should return "Event not found" if no row deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await eventModel.remove({ id: 999 });
      expect(result).toBe('Event not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      const result = await eventModel.remove({ id: 1 });
      expect(result).toBe('Internal server error');
    });
  });
});
