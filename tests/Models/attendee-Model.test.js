// tests/Models/attendee-Model.test.js
import * as attendeeModel from '../../Model/attendee-Model.js'; // Corrected import
import pool from '../../db.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

describe('Attendee Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should return "Attendee created successfully" on successful insert', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, firstname: 'John', lastname: 'Doe', eventid: 1 }] });

      const result = await attendeeModel.insert({ firstname: 'John', lastname: 'Doe', eventid: 1 });
      expect(result).toBe('Attendee created successfully');
    });

    it('should throw "Error creating attendee" if no row inserted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(attendeeModel.insert({ firstname: 'John', lastname: 'Doe', eventid: 1 }))
        .rejects
        .toThrow('Error creating attendee');
    });

    it('should throw DB insert error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB insert error'));

      await expect(attendeeModel.insert({ firstname: 'John', lastname: 'Doe', eventid: 1 }))
        .rejects
        .toThrow('DB insert error');
    });
  });

  describe('selectAll', () => {
    it('should return attendees when found', async () => {
      const fakeAttendees = [{ id: 1, firstname: 'Jane' }, { id: 2, firstname: 'Bob' }];
      pool.query.mockResolvedValueOnce({ rows: fakeAttendees });

      const result = await attendeeModel.selectAll({ id: 1, limitPlusOne: 11, offset: 0 }); // Assuming id is eventId
      expect(result).toEqual(fakeAttendees);
    });

    it('should throw "No attendees found" if none found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(attendeeModel.selectAll({ id: 1, limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow('No attendees found');
    });

    it('should throw DB selectAll error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB selectAll error'));

      await expect(attendeeModel.selectAll({ id: 1, limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow('DB selectAll error');
    });
  });

  describe('selectById', () => {
    it('should return attendee if found', async () => {
      const fakeAttendee = { id: 1, firstname: 'Jane' };
      pool.query.mockResolvedValueOnce({ rows: [fakeAttendee] });

      const result = await attendeeModel.selectById({ id: 1 });
      expect(result).toEqual(fakeAttendee); // selectById returns a single object
    });

    it('should throw "Attendee not found" if no rows', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(attendeeModel.selectById({ id: 999 }))
        .rejects
        .toThrow('Attendee not found');
    });

    it('should throw DB selectById error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB selectById error'));

      await expect(attendeeModel.selectById({ id: 1 }))
        .rejects
        .toThrow('DB selectById error');
    });
  });

  describe('updateFull', () => {
    it('should return updated attendee if successful', async () => {
      const updatedAttendee = { id: 1, firstname: 'Jane', lastname: 'Smith', eventid: 1 };
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [updatedAttendee] });

      const result = await attendeeModel.updateFull(1, { firstname: 'Jane', middlename: null, lastname: 'Smith', eventid: 1 });
      expect(result).toEqual(updatedAttendee);
    });

    it('should throw "Attendee not found" if no rows', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(attendeeModel.updateFull(999, { firstname: 'Jane', middlename: null, lastname: 'Smith', eventid: 1 }))
        .rejects
        .toThrow('Attendee not found');
    });

    it('should throw DB updateFull error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB updateFull error'));

      await expect(attendeeModel.updateFull(1, { firstname: 'Jane', middlename: null, lastname: 'Smith', eventid: 1 }))
        .rejects
        .toThrow('DB updateFull error');
    });
  });

  describe('updatePartial', () => {
    it('should return updated attendee if successful', async () => {
      const updatedAttendee = { id: 1, firstname: 'Jane', eventid: 1 };
      pool.query.mockResolvedValueOnce({ rows: [updatedAttendee] });

      const result = await attendeeModel.updatePartial(1, { firstname: 'Jane' });
      expect(result).toEqual(updatedAttendee);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE attendees\s+SET\s+firstname\s+=\s+\$1\s+WHERE\s+id\s+=\s+\$2\s+RETURNING\s+\*/),
        ['Jane', 1]
      );
    });

    it('should throw "Attendee not found" if no row updated', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(attendeeModel.updatePartial(1, { firstname: 'Jane' }))
        .rejects
        .toThrow('Attendee not found');
    });

    it('should throw DB updatePartial error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB updatePartial error'));

      await expect(attendeeModel.updatePartial(1, { firstname: 'Jane' }))
        .rejects
        .toThrow('DB updatePartial error');
    });

    it('should throw error if fields param missing or invalid', async () => {
      await expect(attendeeModel.updatePartial(1, undefined)).rejects.toThrow('No fields provided or invalid update data.');
      await expect(attendeeModel.updatePartial(1, null)).rejects.toThrow('No fields provided or invalid update data.');
      await expect(attendeeModel.updatePartial(1, {})).rejects.toThrow('No fields provided or invalid update data.');
    });
  });

  describe('remove', () => {
    it('should return "Attendee deleted successfully" if successful', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await attendeeModel.remove({ id: 1 });
      expect(result).toBe('Attendee deleted successfully');
    });

    it('should throw "Attendee not found" if no deletion', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(attendeeModel.remove({ id: 999 }))
        .rejects
        .toThrow('Attendee not found');
    });

    it('should throw DB remove error on exception', async () => {
      pool.query.mockRejectedValue(new Error('DB remove error'));

      await expect(attendeeModel.remove({ id: 1 }))
        .rejects
        .toThrow('DB remove error');
    });
  });
});