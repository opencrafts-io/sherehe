import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from "../../Controllers/event-Controller.js";
import * as eventModel from '../../Model/event-Model.js';

describe('Event Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        'user-agent': 'jest-test',
      },
      ip: '127.0.0.1',
      params: {},
      body: {},
      query: {},
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
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent controller', () => {
    // --- This nested beforeEach block is updated to include headers and ip ---
    beforeEach(() => {
      req = {
        body: {
          name: 'Test Event',
          description: 'Test Description',
          url: 'http://example.com',
          time: '12:00',
          date: '2025-08-10',
          location: 'Test Location',
          organizer: 'Test Org',
          number_of_attendees: 100,
          organizer_id: 1,
          genres: 'Music,Art'
        },
        file: {
          filename: 'test.jpg'
        },
        // ADDED: The headers and ip properties required by the logs function
        headers: {
          'user-agent': 'jest-test',
        },
        ip: '127.0.0.1',
        method: 'POST', // ADDED: Required for the logs function
        url: '/api/events' // ADDED: Required for the logs function
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 201 on successful insert', async () => {
      jest.spyOn(eventModel, 'insert').mockResolvedValue('Event created successfully');

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event created successfully' });
    });

    it('should return 500 when model returns "Error creating event"', async () => {
      jest.spyOn(eventModel, 'insert').mockResolvedValue('Error creating event');

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });

    it('should return 400 if no image uploaded', async () => {
      req.file = undefined;

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No image uploaded' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(eventModel, 'insert').mockRejectedValue(new Error('Database connection error'));

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });
  });

  // --- The rest of the test suite remains unchanged ---

  describe('getAllEvents', () => {
    beforeEach(() => {
      // Re-initializing req here to ensure specific values for this describe block
      req = {
        headers: {
          'user-agent': 'jest-test',
        },
        ip: '127.0.0.1',
        method: 'GET', // ADDED: Required for the logs function
        url: '/api/events', // ADDED: Required for the logs function
        query: {},
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
    });

    it('should return 200 with events', async () => {
      const fakeEvents = [{ id: 1 }, { id: 2 }];
      jest.spyOn(eventModel, 'selectAll').mockResolvedValue(fakeEvents);

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        data: fakeEvents
      });
    });

    it('should return 200 when no events are found', async () => {
      jest.spyOn(eventModel, 'selectAll').mockResolvedValue('No events found');

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(eventModel, 'selectAll').mockRejectedValue(new Error('Database error'));

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching events' });
    });
  });

  describe('getEventById', () => {
    beforeEach(() => {
        req.method = 'GET';
        req.url = '/api/events/1';
    });

    it('should return 200 with event data', async () => {
      req.params = { id: 1 };
      const fakeEvent = { id: 1, name: 'Event' };
      jest.spyOn(eventModel, 'selectById').mockResolvedValue(fakeEvent);

      await getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: fakeEvent });
    });

    it('should return 500 when model returns "Error fetching event"', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'selectById').mockResolvedValue('Error fetching event');

      await getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching event' });
    });

    it('should return 500 on internal server error', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'selectById').mockRejectedValue(new Error('Network error'));

      await getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching event' });
    });
  });

  describe('updateEvent', () => {
    beforeEach(() => {
        req.method = 'PUT';
        req.url = '/api/events';
    });

    it('should return 200 on success', async () => {
      req.body = { id: 1, name: 'Updated' };
      jest.spyOn(eventModel, 'update').mockResolvedValue('Event updated successfully');

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event updated successfully' });
    });

    it('should return 500 when model returns "Error updating event"', async () => {
      req.body = { id: 1 };
      jest.spyOn(eventModel, 'update').mockResolvedValue('Error updating event');

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating event' });
    });

    it('should return 500 on internal server error', async () => {
      req.body = { id: 1 };
      jest.spyOn(eventModel, 'update').mockRejectedValue(new Error('Validation error'));

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating event' });
    });
  });

  describe('deleteEvent', () => {
    beforeEach(() => {
        req.method = 'DELETE';
        req.url = '/api/events/1';
    });

    it('should return 200 on success', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'remove').mockResolvedValue('Event deleted successfully');

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event deleted successfully' });
    });

    it('should return 500 when model returns "Error deleting event"', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'remove').mockResolvedValue('Error deleting event');

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting event' });
    });

    it('should return 500 on internal server error', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'remove').mockRejectedValue(new Error('Permission denied'));

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting event' });
    });
  });
});