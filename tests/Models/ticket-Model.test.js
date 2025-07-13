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
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' }))
        .rejects
        .toThrow('Wrong Event ID');
    });

    it('should return "Wrong Attendee ID" if attendee does not exist', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' }))
        .rejects
        .toThrow('Wrong Attendee ID');
    });

    it('should return success message on successful insert', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, attendeeid: 1, eventid: 1, paymentcode: 'abc' }] });

      const result = await ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toBe('Ticket created successfully');
    });

    it('should return error message if insert failed', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rowCount: 0 });

      await expect(ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' }))
        .rejects
        .toThrow('Error creating ticket');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB failure'));

      await expect(ticketModel.insert({ attendeeid: 1, eventid: 1, paymentcode: 'abc' }))
        .rejects
        .toThrow('DB failure');
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

      await expect(ticketModel.selectAllByAttendeeId({ id: 1 }))
        .rejects
        .toThrow('No tickets found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB connection failed'));

      await expect(
        ticketModel.selectAllByAttendeeId({ id: 1, limitPlusOne: 11, offset: 0 })
      ).rejects.toThrow('DB connection failed');
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

      await expect(ticketModel.selectByEventId({ id: 999 }))
        .rejects
        .toThrow('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB query failed'));

      await expect(
        ticketModel.selectByEventId({ id: 1, limitPlusOne: 11, offset: 0 })
      ).rejects.toThrow('DB query failed');
    });
  });

  describe('updateFull', () => {
    it('should return the updated ticket data if ticket updated', async () => {
      const updatedTicket = { id: 1, attendeeid: 1, eventid: 1, paymentcode: 'abc' };
      pool.query.mockResolvedValue({ rowCount: 1, rows: [updatedTicket] });

      const result = await ticketModel.updateFull(1, { attendeeid: 1, eventid: 1, paymentcode: 'abc' });
      expect(result).toEqual(updatedTicket);
    });

    it('should return "Ticket not found" if no rows updated', async () => {
      pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

      await expect(ticketModel.updateFull(999, { attendeeid: 1, eventid: 1, paymentcode: 'abc' }))
        .rejects
        .toThrow('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB update failed'));

      await expect(ticketModel.updateFull(1, { attendeeid: 1, eventid: 1, paymentcode: 'abc' }))
        .rejects
        .toThrow('DB update failed');
    });
  });

 describe('updatePartial', () => {
    it('should update partial fields and return updated row', async () => {
      const updatedRow = { id: 1, paymentcode: 'newcode' };
      pool.query.mockResolvedValue({ rows: [updatedRow] });

      const result = await ticketModel.updatePartial(1, { paymentcode: 'newcode' });
      expect(result).toEqual(updatedRow);
      expect(pool.query).toHaveBeenCalledWith(

        expect.stringMatching(/UPDATE tickets\s+SET\s+paymentcode\s+=\s+\$1\s+WHERE\s+id\s+=\s+\$2\s+RETURNING\s+\*/),
        ['newcode', 1]
      );
    });

    it('should return "Ticket not found" if no row updated', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await expect(ticketModel.updatePartial(1, { paymentcode: 'newcode' }))
        .rejects
        .toThrow('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('Partial update DB error'));

      await expect(ticketModel.updatePartial(1, { paymentcode: 'newcode' }))
        .rejects
        .toThrow('Partial update DB error');
    });

    it('should throw error if fields param missing or invalid', async () => {
      await expect(ticketModel.updatePartial(1, undefined)).rejects.toThrow('No fields provided or invalid update data.');
      await expect(ticketModel.updatePartial(1, null)).rejects.toThrow('No fields provided or invalid update data.');
      await expect(ticketModel.updatePartial(1, {})).rejects.toThrow('No fields provided or invalid update data.');
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

      await expect(ticketModel.remove({ id: 999 }))
        .rejects
        .toThrow('Ticket not found');
    });

    it('should return internal error on DB failure', async () => {
      pool.query.mockRejectedValue(new Error('DB deletion failed'));

      await expect(ticketModel.remove({ id: 1 }))
        .rejects
        .toThrow('DB deletion failed');
    });
  });
});