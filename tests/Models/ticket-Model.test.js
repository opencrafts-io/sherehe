import * as ticketModel from '../../Model/ticket-Model.js';
import pool from '../../db.js';

jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

describe('ticketModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert', () => {
    it('should return "Wrong Event ID" if event does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // checkEvent returns empty

      const result = await ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Wrong Event ID');
    });

    it('should return "Wrong Attendee ID" if attendee does not exist', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{}] }) // checkEvent returns found
        .mockResolvedValueOnce({ rows: [] });  // checkAttendee returns empty

      const result = await ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Wrong Attendee ID');
    });

    it('should return success message on successful insert', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{}] }) // checkEvent
        .mockResolvedValueOnce({ rows: [{}] }) // checkAttendee
        .mockResolvedValueOnce({ rowCount: 1, rows: [{}] }); // insert

      const result = await ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Ticket created successfully');
    });

    it('should return error message if insert failed', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{}] }) // checkEvent
        .mockResolvedValueOnce({ rows: [{}] }) // checkAttendee
        .mockResolvedValueOnce({ rowCount: 0 }); // insert

      const result = await ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Error creating ticket');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB failure'));

      const result = await ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Internal server error');
    });
  });

  describe('selectAllByAttendeeId', () => {
    it('should return tickets when found', async () => {
      const fakeRows = [{ id: 1 }, { id: 2 }];
      pool.query.mockResolvedValue({ rows: fakeRows });

      const result = await ticketModel.selectAllByAttendeeId({ id: 1 });
      expect(result).toEqual(fakeRows);
    });

    it('should return "No tickets found" if none found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ticketModel.selectAllByAttendeeId({ id: 1 });
      expect(result).toBe('No tickets found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      await expect(
        ticketModel.selectAllByAttendeeId({ id: 1, limitPlusOne: 11, offset: 0 })
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('selectByEventId', () => {
    it('should return tickets when found', async () => {
      const fakeRows = [{ id: 1 }];
      pool.query.mockResolvedValue({ rows: fakeRows });

      const result = await ticketModel.selectByEventId({ id: 1 });
      expect(result).toEqual(fakeRows);
    });

    it('should return "Ticket not found" if none found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ticketModel.selectByEventId({ id: 999 });
      expect(result).toBe('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      await expect(
        ticketModel.selectByEventId({ id: 1, limitPlusOne: 11, offset: 0 })
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('updateFull', () => {
    it('should return success if ticket updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await ticketModel.updateFull(1, { attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Ticket updated successfully');
    });

    it('should return "Ticket not found" if no rows updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await ticketModel.updateFull(999, { attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      const result = await ticketModel.updateFull(1, { attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Internal server error');
    });
  });

  describe('updatePartial', () => {
    it('should update partial fields and return updated row', async () => {
      const updatedRow = { id: 1, paymentcode: 'newcode' };
      pool.query.mockResolvedValue({ rows: [updatedRow] });

      const result = await ticketModel.updatePartial( 1, { paymentcode: 'newcode' });
      expect(result).toEqual(updatedRow);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tickets SET paymentcode = $1 WHERE id = $2 RETURNING *'),
        ['newcode', 1]
      );
    });

    it('should return null if no row updated', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ticketModel.updatePartial(1, { paymentcode: 'newcode' });
      expect(result).toBeNull();
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      await expect(ticketModel.updatePartial(1, { paymentcode: 'newcode' }))
        .rejects
        .toThrow('Internal server error');
    });

    it('should throw error if fields param missing or invalid', async () => {
      await expect(() => ticketModel.updatePartial({ id: 1 })).rejects.toThrow('No fields provided or invalid update data.');
      await expect(() => ticketModel.updatePartial({ id: 1, fields: null })).rejects.toThrow('No fields provided or invalid update data.');
    });
  });

  describe('remove', () => {
    it('should return success message if ticket deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await ticketModel.remove({ id: 1 });
      expect(result).toBe('Ticket deleted successfully');
    });

    it('should return "Ticket not found" if no ticket deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await ticketModel.remove({ id: 999 });
      expect(result).toBe('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error());

      const result = await ticketModel.remove({ id: 1 });
      expect(result).toBe('Internal server error');
    });
  });
});
