import * as ticketModel from '../../Model/ticket-Model.js';
import pool from '../../db.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

jest.mock('../../utils/logs.js', () => ({
  logs: jest.fn()
}));

describe('ticketModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should return "Wrong Event ID" if event does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await ticketModel.insert({ attendee_id: 1, event_id: 1, payment_code: 'abc' });
      expect(result).toBe('Wrong Event ID');
    });

    it('should return "Wrong Attendee ID" if attendee does not exist', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Mock event found
        .mockResolvedValueOnce({ rows: [] }); // Mock attendee not found

      const result = await ticketModel.insert({ attendee_id: 1, event_id: 1, payment_code: 'abc' });
      expect(result).toBe('Wrong Attendee ID');
    });

    it('should return "Ticket created successfully" on successful insert', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Mock event found
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Mock attendee found
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, attendee_id: 1, event_id: 1, payment_code: 'abc' }] }); // Mock insert successful

      const result = await ticketModel.insert({ attendee_id: 1, event_id: 1, payment_code: 'abc' });
      expect(result).toBe('Ticket created successfully');
    });

    it('should return "Error creating ticket" if no row inserted', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Mock event found
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Mock attendee found
        .mockResolvedValueOnce({ rowCount: 0 }); // Mock insert failed

      const result = await ticketModel.insert({ attendee_id: 1, event_id: 1, payment_code: 'abc' });
      expect(result).toBe('Error creating ticket');
    });

    it('should throw an error on database failure', async () => {
      const dbError = new Error('DB insert failure');
      pool.query.mockRejectedValue(dbError);

      await expect(ticketModel.insert({ attendee_id: 1, event_id: 1, payment_code: 'abc' }))
        .rejects
        .toThrow(dbError);
    });
  });

  describe('selectAllByAttendeeId', () => {
    it('should return an array of tickets when found', async () => {
      const fakeRows = [{ id: 1, attendee_id: 1 }, { id: 2, attendee_id: 1 }];
      pool.query.mockResolvedValue({ rows: fakeRows });

      const result = await ticketModel.selectAllByAttendeeId({ id: 1, limitPlusOne: 11, offset: 0 });
      expect(result).toEqual(fakeRows);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM tickets WHERE attendee_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [1, 11, 0]
      );
    });

    it('should return "No tickets found" if none found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ticketModel.selectAllByAttendeeId({ id: 1, limitPlusOne: 11, offset: 0 });
      expect(result).toBe('No tickets found');
    });

    it('should throw an error on database failure', async () => {
      const dbError = new Error('DB select failure');
      pool.query.mockRejectedValue(dbError);

      await expect(ticketModel.selectAllByAttendeeId({ id: 1, limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow(dbError);
    });
  });

  describe('selectByEventId', () => {
    it('should return an array of tickets when found', async () => {
      const fakeRows = [{ id: 1, event_id: 99 }, { id: 2, event_id: 99 }];
      pool.query.mockResolvedValue({ rows: fakeRows });

      const result = await ticketModel.selectByEventId({ id: 99, limitPlusOne: 11, offset: 0 });
      expect(result).toEqual(fakeRows);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM tickets WHERE event_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [99, 11, 0]
      );
    });

    it('should return "Ticket not found" if none found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ticketModel.selectByEventId({ id: 999, limitPlusOne: 11, offset: 0 });
      expect(result).toBe('Ticket not found');
    });

    it('should throw an error on database failure', async () => {
      const dbError = new Error('DB select failure');
      pool.query.mockRejectedValue(dbError);

      await expect(ticketModel.selectByEventId({ id: 99, limitPlusOne: 11, offset: 0 }))
        .rejects
        .toThrow(dbError);
    });
  });

  describe('updateFull', () => {
    it('should return the updated ticket object on successful update', async () => {
      const updatedTicket = { id: 1, attendee_id: 1, event_id: 1, payment_code: 'new_code' };
      pool.query.mockResolvedValue({ rowCount: 1, rows: [updatedTicket] });

      const result = await ticketModel.updateFull(1, { attendeeid: 1, eventid: 1, paymentcode: 'new_code' });
      expect(result).toEqual(updatedTicket);
    });

    it('should return "Ticket not found" if no row is updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

      const result = await ticketModel.updateFull(999, { attendeeid: 1, eventid: 1, paymentcode: 'new_code' });
      expect(result).toBe('Ticket not found');
    });

    it('should throw an error on database failure', async () => {
      const dbError = new Error('DB update failure');
      pool.query.mockRejectedValue(dbError);

      await expect(ticketModel.updateFull(1, { attendeeid: 1, eventid: 1, paymentcode: 'new_code' }))
        .rejects
        .toThrow(dbError);
    });
  });

  describe('updatePartial', () => {
    it('should return the updated ticket object on a successful partial update', async () => {
      const updatedTicket = { id: 1, payment_code: 'new_code' };
      pool.query.mockResolvedValue({ rows: [updatedTicket] });

      const result = await ticketModel.updatePartial(1, { payment_code: 'new_code' });
      expect(result).toEqual(updatedTicket);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE tickets\s+SET payment_code = \$1\s+WHERE id = \$2\s+RETURNING \*/),
        ['new_code', 1]
      );
    });

    it('should throw "Ticket not found" if no row is updated', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await expect(ticketModel.updatePartial(1, { payment_code: 'new_code' }))
        .rejects
        .toThrow('Ticket not found');
    });

    it('should return "No fields provided or invalid update data." if fields param is invalid', async () => {
      const result = await ticketModel.updatePartial(1, {});
      expect(result).toBe("No fields provided or invalid update data.");
    });

    it('should throw an error on database failure', async () => {
      const dbError = new Error('DB partial update failure');
      pool.query.mockRejectedValue(dbError);

      await expect(ticketModel.updatePartial(1, { payment_code: 'new_code' }))
        .rejects
        .toThrow(dbError);
    });
  });

  describe('remove', () => {
    it('should return "Ticket deleted successfully" on a successful deletion', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await ticketModel.remove({ id: 1 });
      expect(result).toBe('Ticket deleted successfully');
      expect(pool.query).toHaveBeenCalledWith("DELETE FROM tickets WHERE id = $1", [1]);
    });

    it('should return "Ticket not found" if no row is deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await ticketModel.remove({ id: 999 });
      expect(result).toBe('Ticket not found');
    });

    it('should throw an error on database failure', async () => {
      const dbError = new Error('DB remove failure');
      pool.query.mockRejectedValue(dbError);

      await expect(ticketModel.remove({ id: 1 }))
        .rejects
        .toThrow(dbError);
    });
  });
});