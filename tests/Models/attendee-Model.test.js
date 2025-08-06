import * as attendeeModel from '../../Model/attendee-Model.js';
import pool from '../../db.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));




describe('attendeeModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should return "Attendee created successfully" and update event attendees count on success', async () => {
      // Mock the initial insert query to be successful
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          event_id: 101
        }]
      });

      // Mock the second query for updating the number_of_attendees
      pool.query.mockResolvedValueOnce({
        rowCount: 1
      });

      const params = {
        first_name: 'John',
        last_name: 'Doe',
        event_id: 101
      };
      const result = await attendeeModel.insert(params);
      expect(result).toBe('Attendee created successfully');
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE events SET number_of_attendees = number_of_attendees + 1'),
        [101]
      );
    });

    it('should return "Error creating attendee" if the insert query fails', async () => {
      pool.query.mockResolvedValueOnce({
        rowCount: 0
      });

      const params = {
        first_name: 'John',
        last_name: 'Doe',
        event_id: 101
      };
      const result = await attendeeModel.insert(params);
      expect(result).toBe('Error creating attendee');
    });

    it('should throw an error on database failure during insert', async () => {
      const dbError = new Error('DB insert failure');
      pool.query.mockRejectedValue(dbError);

      const params = {
        first_name: 'John',
        last_name: 'Doe',
        event_id: 101
      };
      await expect(attendeeModel.insert(params)).rejects.toThrow(dbError);
    });
  });

  describe('selectAll', () => {
    it('should return a formatted array of attendees when found', async () => {
      const fakeRows = [{
        id: 1,
        first_name: 'John',
        event_id: 101
      }, {
        id: 2,
        first_name: 'Jane',
        event_id: 101
      },];
      pool.query.mockResolvedValue({
        rows: fakeRows
      });

      const params = {
        id: 101,
        limitPlusOne: 11,
        offset: 0
      };
      const result = await attendeeModel.selectAll(params);

      const expectedFormattedRows = fakeRows.map(row => ({
        ...row,
        id: row.id.toString(),
        event_id: row.event_id.toString(),
      }));

      expect(result).toEqual(expectedFormattedRows);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM attendees WHERE event_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [101, 11, 0]
      );
    });

    it('should return "No attendees found" if no attendees exist for the event', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const params = {
        id: 101,
        limitPlusOne: 11,
        offset: 0
      };

      const result = await attendeeModel.selectAll(params);
      expect(result).toBe("No attendees found");
    });

    it('should throw an error on database failure during selectAll', async () => {
      const dbError = new Error('DB selectAll failure');
      pool.query.mockRejectedValue(dbError);

      const params = {
        id: 101,
        limitPlusOne: 11,
        offset: 0
      };
      await expect(attendeeModel.selectAll(params)).rejects.toThrow(dbError);
    });
  });

  describe('selectById', () => {
    it('should return the attendee object when found', async () => {
      const fakeAttendee = {
        id: 1,
        first_name: 'John',
        event_id: 101
      };
      pool.query.mockResolvedValue({
        rows: [fakeAttendee]
      });

      const params = {
        id: 1
      };
      const result = await attendeeModel.selectById(params);
      expect(result).toEqual(fakeAttendee);
      expect(pool.query).toHaveBeenCalledWith("SELECT * FROM attendees WHERE id = $1", [1]);
    });

    it('should return "Attendee not found" if no attendee is returned', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const params = {
        id: 999
      };
      const result = await attendeeModel.selectById(params);
      expect(result).toBe('Attendee not found');
    });

    it('should throw an error on database failure during selectById', async () => {
      const dbError = new Error('DB selectById failure');
      pool.query.mockRejectedValue(dbError);

      const params = {
        id: 1
      };
      await expect(attendeeModel.selectById(params)).rejects.toThrow(dbError);
    });
  });

  describe('updateFull', () => {
    it('should return the updated attendee object on a successful update', async () => {
      const updatedAttendee = {
        id: 1,
        first_name: 'Jane',
        middle_name: null,
        last_name: 'Doe',
        event_id: 101
      };
      pool.query.mockResolvedValue({
        rows: [updatedAttendee]
      });

      const result = await attendeeModel.updateFull(1, {
        first_name: 'Jane',
        middle_name: null,
        last_name: 'Doe',
        event_id: 101
      });
      expect(result).toEqual(updatedAttendee);
    });

    it('should throw "Attendee not found" if no row is updated', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      await expect(attendeeModel.updateFull(999, {
        first_name: 'Jane',
        last_name: 'Doe',
        event_id: 101
      })).rejects.toThrow('Attendee not found');
    });

    it('should throw an error on database failure during updateFull', async () => {
      const dbError = new Error('DB updateFull failure');
      pool.query.mockRejectedValue(dbError);

      await expect(attendeeModel.updateFull(1, {
        first_name: 'Jane',
        last_name: 'Doe',
        event_id: 101
      })).rejects.toThrow(dbError);
    });
  });

  describe('updatePartial', () => {
    it('should return the updated attendee object on a successful partial update', async () => {
      const updatedAttendee = {
        id: 1,
        first_name: 'John',
        last_name: 'Smith'
      };
      pool.query.mockResolvedValue({
        rows: [updatedAttendee]
      });

      const fields = {
        last_name: 'Smith'
      };
      const result = await attendeeModel.updatePartial(1, fields);
      expect(result).toEqual(updatedAttendee);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE attendees\s+SET last_name = \$1\s+WHERE id = \$2\s+RETURNING \*/),
        ['Smith', 1]
      );
    });

    it('should throw "Attendee not found" if no row is updated', async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const fields = {
        last_name: 'Smith'
      };
      await expect(attendeeModel.updatePartial(999, fields)).rejects.toThrow('Attendee not found');
    });

    it('should throw an error if fields param is invalid or empty', async () => {
      await expect(attendeeModel.updatePartial(1, {})).rejects.toThrow('No fields provided or invalid update data.');
      await expect(attendeeModel.updatePartial(1, null)).rejects.toThrow('No fields provided or invalid update data.');
    });

    it('should throw an error on database failure during updatePartial', async () => {
      const dbError = new Error('DB updatePartial failure');
      pool.query.mockRejectedValue(dbError);

      const fields = {
        last_name: 'Smith'
      };
      await expect(attendeeModel.updatePartial(1, fields)).rejects.toThrow(dbError);
    });
  });

  describe('remove', () => {
    // ... existing tests

    it('should return "Attendee not found" if the attendee does not exist', async () => {
      // This test's expectation was wrong, it should be "Attendee deleted successfully"
      // Since the model code returns this string regardless of whether the attendee is found or not,
      // and doesn't actually delete it.
      // Let's first fix the model code.
      // Then, the test should check for "Attendee not found" and "Attendee deleted successfully"
      // based on the query result.
      pool.query.mockResolvedValueOnce({ rowCount: 0 }); // Mock no attendee found

      const params = { id: 999 };
      const result = await attendeeModel.remove(params);
      expect(result).toBe('Attendee not found'); // This now correctly matches the model's return for this case
    });

    it('should throw an error on database failure during remove', async () => {
      // This test's expectation was wrong. The model returns a string, not an error.
      // Let's fix the model code first to actually throw an error on DB failure.
      const dbError = new Error('DB remove failure');
      pool.query.mockRejectedValueOnce(dbError);

      const params = { id: 1 };
      // The original test was correct if the model threw an error, so we will use this logic
      await expect(attendeeModel.remove(params)).rejects.toThrow(dbError);
    });
  })
});
