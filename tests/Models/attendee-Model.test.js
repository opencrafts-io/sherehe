import * as attendeeModel from '../../Model/attendee-Model.js';
import pool from '../../db.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

describe('Attendee Model', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should return success if row is inserted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await attendeeModel.insert({
        firstname: 'John',
        middlename: 'K',
        lastname: 'Doe',
        eventid: 1
      });

      expect(result).toBe('Attendee created successfully');
    });

    it('should return error if no row inserted', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await attendeeModel.insert({
        firstname: 'John',
        middlename: '',
        lastname: 'Doe',
        eventid: 1
      });

      expect(result).toBe('Error creating attendee');
    });

    it('should return internal server error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      const result = await attendeeModel.insert({});

      expect(result).toBe('Internal server error');
    });
  });

  describe('selectAll', () => {
    it('should return attendees if found', async () => {
      const rows = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows });

      const result = await attendeeModel.selectAll({ id: 1 });

      expect(result).toEqual(rows);
    });

    it('should return not found if no attendees', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await attendeeModel.selectAll({ id: 1 });

      expect(result).toBe('No attendees found');
    });

    it('should return internal error on failure', async () => {
      pool.query.mockRejectedValue(new Error('Error'));

      const result = await attendeeModel.selectAll({ id: 1 });

      expect(result).toBe('Internal server error');
    });
  });

  describe('selectById', () => {
    it('should return attendee if found', async () => {
      const rows = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows });

      const result = await attendeeModel.selectById({ id: 1 });

      expect(result).toEqual(rows);
    });

    it('should return not found if no rows', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await attendeeModel.selectById({ id: 1 });

      expect(result).toBe('Attendee not found');
    });

    it('should return internal server error on exception', async () => {
      pool.query.mockRejectedValue(new Error('error'));

      const result = await attendeeModel.selectById({ id: 1 });

      expect(result).toBe('Internal server error');
    });
  });

  describe('updateFull', () => {
    it('should return updated attendee', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await attendeeModel.updateFull(1, {
        firstname: 'Jane',
        middlename: 'M',
        lastname: 'Doe',
        eventid: 2,
      });

      expect(result).toEqual({ id: 1 });
    });

    it('should return null if no rows', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await attendeeModel.updateFull(1, {});

      expect(result).toBeNull();
    });

    it('should return internal error on exception', async () => {
      pool.query.mockRejectedValue(new Error('fail'));

      const result = await attendeeModel.updateFull(1, {});

      expect(result).toBe('Internal server error');
    });
  });

  describe('updatePartial', () => {
    it('should return updated attendee on valid fields', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, firstname: 'Updated' }] });

      const result = await attendeeModel.updatePartial(1, { firstname: 'Updated' });

      expect(result).toEqual({ id: 1, firstname: 'Updated' });
    });

    it('should return null if no row found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await attendeeModel.updatePartial(1, { firstname: 'Updated' });

      expect(result).toBeNull();
    });

    it('should return internal error on exception', async () => {
      pool.query.mockRejectedValue(new Error('fail'));

      const result = await attendeeModel.updatePartial(1, { firstname: 'Updated' });

      expect(result).toBe('Internal server error');
    });
  });

  describe('remove', () => {
    it('should return success if attendee deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await attendeeModel.remove({ id: 1 });

      expect(result).toBe('Attendee deleted successfully');
    });

    it('should return not found if no deletion', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await attendeeModel.remove({ id: 1 });

      expect(result).toBe('Attendee not found');
    });

    it('should return internal error on exception', async () => {
      pool.query.mockRejectedValue(new Error('error'));

      const result = await attendeeModel.remove({ id: 1 });

      expect(result).toBe('Internal server error');
    });
  });
});
