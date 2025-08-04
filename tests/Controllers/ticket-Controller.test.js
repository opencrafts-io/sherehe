import { createTicket, getAllTicketsByAttendeeId, getTicketByEventId, updateTicketFull, updateTicketPartial, deleteTicket } from "../../Controllers/ticket-Controller.js";
import * as ticketModel from '../../Model/ticket-Model.js';

describe('Ticket Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        'user-agent': 'jest-test',
      },
      ip: '127.0.0.1',
      params: {},
      body: {},
      pagination: {
        page: 1,
        limit: 10,
        offset: 0,
        limitPlusOne: 11,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should return 201 on successful creation', async () => {
      req.body = { attendeeid: 1, eventid: 1, paymentcode: 'PAY123' };
      jest.spyOn(ticketModel, 'insert').mockResolvedValue('Ticket created successfully');

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket created successfully' });
    });

    it('should return 403 when model returns "Error creating ticket"', async () => {
      req.body = { attendeeid: 1, eventid: 1, paymentcode: 'PAY123' };
      jest.spyOn(ticketModel, 'insert').mockResolvedValue('Error creating ticket');

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating ticket' });
    });

    it('should return 404 when model returns "Wrong Event ID"', async () => {
      req.body = { attendeeid: 1, eventid: 99, paymentcode: 'PAY123' };
      jest.spyOn(ticketModel, 'insert').mockResolvedValue('Wrong Event ID');

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Wrong Event ID' });
    });

    it('should return 404 when model returns "Wrong Attendee ID"', async () => {
      req.body = { attendeeid: 99, eventid: 1, paymentcode: 'PAY123' };
      jest.spyOn(ticketModel, 'insert').mockResolvedValue('Wrong Attendee ID');

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Wrong Attendee ID' });
    });

    it('should return 500 on unexpected model response', async () => {
      req.body = { attendeeid: 1, eventid: 1, paymentcode: 'PAY123' };
      jest.spyOn(ticketModel, 'insert').mockResolvedValue('Some other error');

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 500 on internal server error', async () => {
      req.body = { attendeeid: 1, eventid: 1, paymentcode: 'PAY123' };
      jest.spyOn(ticketModel, 'insert').mockRejectedValue(new Error('Database connection error'));

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating ticket' });
    });
  });

  describe('getAllTicketsByAttendeeId', () => {
    beforeEach(() => {
      req = {
        headers: {
          'user-agent': 'jest-test',
        },
        ip: '127.0.0.1',
        params: { attendeeId: 1 },
        body: {},
        pagination: {
          page: 1,
          limit: 10,
          offset: 0,
          limitPlusOne: 11,
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return 200 with tickets when found', async () => {
      const fakeTickets = [{ id: 1, attendeeid: 1 }, { id: 2, attendeeid: 1 }];
      jest.spyOn(ticketModel, 'selectAllByAttendeeId').mockResolvedValue(fakeTickets);

      await getAllTicketsByAttendeeId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        data: fakeTickets
      });
    });

    it('should return 404 when no tickets are found', async () => {
      jest.spyOn(ticketModel, 'selectAllByAttendeeId').mockResolvedValue('No tickets found');

      await getAllTicketsByAttendeeId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No tickets found for attendee ID' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(ticketModel, 'selectAllByAttendeeId').mockRejectedValue(new Error('Database connection error'));

      await getAllTicketsByAttendeeId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching tickets' });
    });
  });

  describe('getTicketByEventId', () => {
    beforeEach(() => {
      req = {
        headers: {
          'user-agent': 'jest-test',
        },
        ip: '127.0.0.1',
        params: { eventId: 1 },
        body: {},
        pagination: {
          page: 1,
          limit: 10,
          offset: 0,
          limitPlusOne: 11,
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return 200 with tickets when found', async () => {
      const fakeTickets = [{ id: 1, eventid: 1 }, { id: 2, eventid: 1 }];
      jest.spyOn(ticketModel, 'selectByEventId').mockResolvedValue(fakeTickets);

      await getTicketByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        data: fakeTickets
      });
    });

    it('should return 404 when ticket not found', async () => {
      jest.spyOn(ticketModel, 'selectByEventId').mockResolvedValue('Ticket not found');

      await getTicketByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found by Event ID' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(ticketModel, 'selectByEventId').mockRejectedValue(new Error('Query failed'));

      await getTicketByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching tickets' });
    });
  });

  describe('updateTicketFull', () => {
    it('should return 200 on successful full update', async () => {
      req.params = { id: 1 };
      req.body = { attendeeid: 1, eventid: 2, paymentcode: 'UPDATED' };
      const updatedTicketData = { id: 1, ...req.body };
      jest.spyOn(ticketModel, 'updateFull').mockResolvedValue(updatedTicketData);

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: updatedTicketData });
    });

    it('should return 404 when ticket not found for full update', async () => {
      req.params = { id: 1 };
      req.body = { attendeeid: 1, eventid: 2, paymentcode: 'UPDATED' };
      jest.spyOn(ticketModel, 'updateFull').mockResolvedValue('Ticket not found');

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found for full update' });
    });

    it('should return 500 when model returns "Internal server error" for full update', async () => {
      req.params = { id: 1 };
      req.body = { attendeeid: 1, eventid: 2, paymentcode: 'UPDATED' };
      jest.spyOn(ticketModel, 'updateFull').mockResolvedValue('Internal server error');

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 500 on other internal server error during full update', async () => {
      req.params = { id: 1 };
      req.body = { attendeeid: 1, eventid: 2, paymentcode: 'UPDATED' };
      jest.spyOn(ticketModel, 'updateFull').mockRejectedValue(new Error('DB error'));

      await updateTicketFull(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error updating ticket' });
    });
  });

  describe('updateTicketPartial', () => {
    it('should return 200 on successful partial update', async () => {
      req.params = { id: 1 };
      req.body = { paymentcode: 'PARTIAL' };
      const patchedTicketData = { id: 1, attendeeid: 1, eventid: 1, paymentcode: 'PARTIAL' };
      jest.spyOn(ticketModel, 'updatePartial').mockResolvedValue(patchedTicketData);

      await updateTicketPartial(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Ticket partially updated successfully',
        data: patchedTicketData,
      });
    });

    it('should return 404 when ticket not found for partial update', async () => {
      req.params = { id: 1 };
      req.body = { paymentcode: 'PARTIAL' };
      jest.spyOn(ticketModel, 'updatePartial').mockResolvedValue(null);

      await updateTicketPartial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found for partial update' });
    });

    it('should return 500 on internal server error during partial update', async () => {
      req.params = { id: 1 };
      req.body = { paymentcode: 'PARTIAL' };
      jest.spyOn(ticketModel, 'updatePartial').mockRejectedValue(new Error('Validation error'));

      await updateTicketPartial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating ticket' });
    });
  });

  describe('deleteTicket', () => {
    it('should return 200 on successful deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(ticketModel, 'remove').mockResolvedValue('Ticket deleted successfully');

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: 'Ticket deleted successfully' });
    });

    it('should return 404 when ticket not found for deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(ticketModel, 'remove').mockResolvedValue('Ticket not found');

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ticket not found for deletion' });
    });

    it('should return 500 when model returns "Internal server error" for deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(ticketModel, 'remove').mockResolvedValue('Internal server error');

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 500 on other internal server error during deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(ticketModel, 'remove').mockRejectedValue(new Error('DB constraint error'));

      await deleteTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting ticket' });
    });
  });
});