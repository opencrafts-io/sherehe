import {
  createTicket,
  getAllTicketsByAttendeeId,
  getTicketByEventId,
  updateTicketFull,
  updateTicketPartial,
  deleteTicket
} from '../../Controllers/ticket-Controller.js';

import * as ticketModel from '../../Model/ticket-Model.js';

describe('Ticket Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should return 201 on successful creation', async () => {
      jest.spyOn(ticketModel, 'insert').mockResolvedValue('Ticket created successfully');

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket created successfully' });
    });

    it.each([
      ['Error creating ticket', 403, { error: 'Error creating ticket' }],
      ['Wrong Event ID', 403, { error: 'Wrong Event ID' }],
      ['Wrong Attendee ID', 403, { error: 'Wrong Attendee ID' }],
      ['Unknown error', 500, { error: 'Internal server error' }],
    ])('should handle "%s"', async (mockResult, expectedStatus, expectedJson) => {
      jest.spyOn(ticketModel, 'insert').mockResolvedValue(mockResult);

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });

  describe('getAllTicketsByAttendeeId', () => {
    beforeEach(() => {
      req = {
        params: { id: 1 },
        pagination: {
          page: 1,
          limit: 10,
          offset: 0,
          limitPlusOne: 11
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should return 200 with ticket list', async () => {
      const tickets = [{ id: 1 }];
      jest.spyOn(ticketModel, 'selectAllByAttendeeId').mockResolvedValue(tickets);

      await getAllTicketsByAttendeeId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        data: tickets
      });
    });

    it('should return 404 if no tickets found', async () => {
      jest.spyOn(ticketModel, 'selectAllByAttendeeId').mockResolvedValue('No tickets found');

      await getAllTicketsByAttendeeId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No tickets found' });
    });

    it('should return 500 on server error', async () => {
      jest
        .spyOn(ticketModel, 'selectAllByAttendeeId')
        .mockRejectedValue(new Error('Internal server error'));

      await getAllTicketsByAttendeeId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching tickets' });
    });
  });

  describe('getTicketByEventId', () => {
    beforeEach(() => {
      req = {
        params: { id: 1 },
        pagination: {
          page: 1,
          limit: 10,
          offset: 0,
          limitPlusOne: 11
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should return 200 with ticket info', async () => {
      const ticket = { id: 1 };
      jest.spyOn(ticketModel, 'selectByEventId').mockResolvedValue(ticket);

      await getTicketByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        data: ticket
      });
    });

    it('should return 404 if ticket not found', async () => {
      jest.spyOn(ticketModel, 'selectByEventId').mockResolvedValue('Ticket not found');

      await getTicketByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
    });

    it('should return 500 on internal server error', async () => {
      jest
        .spyOn(ticketModel, 'selectByEventId')
        .mockRejectedValue(new Error('DB error'));

      await getTicketByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching tickets' });
    });
  });

  describe('updateTicketFull', () => {
    it('should return 200 on success', async () => {
      const updated = { id: 1 };
      jest.spyOn(ticketModel, 'updateFull').mockResolvedValue(updated);

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: updated });
    });

    it('should return 404 if ticket not found', async () => {
      jest.spyOn(ticketModel, 'updateFull').mockResolvedValue('Ticket not found');

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
    });

    it('should return 500 on internal error', async () => {
      jest.spyOn(ticketModel, 'updateFull').mockResolvedValue('Internal server error');

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateTicketPartial', () => {
    it('should return 200 on success', async () => {
      const patched = { id: 1 };
      jest.spyOn(ticketModel, 'updatePartial').mockResolvedValue(patched);

      await updateTicketPartial(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Ticket partially updated successfully',
        data: patched,
    });
    });

    it('should return 404 if ticket not found', async () => {
      jest.spyOn(ticketModel, 'updatePartial').mockResolvedValue(null);

      await updateTicketPartial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
    });

    it('should return 500 on internal error', async () => {
      jest.spyOn(ticketModel, 'updatePartial').mockRejectedValue(new Error('DB failure'));

      await updateTicketPartial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error updating ticket" });
    });
  });

  describe('deleteTicket', () => {
    it('should return 200 on success', async () => {
      jest.spyOn(ticketModel, 'remove').mockResolvedValue('Deleted');

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: 'Deleted' });
    });

    it('should return 404 if ticket not found', async () => {
      jest.spyOn(ticketModel, 'remove').mockResolvedValue('Ticket not found');

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(ticketModel, 'remove').mockResolvedValue('Internal server error');

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
