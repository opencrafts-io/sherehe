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
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should return 200 on successful insert', async () => {
      req.body = { name: 'Test Event' };
      jest.spyOn(eventModel, 'insert').mockResolvedValue('Event created successfully');

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event created successfully' });
    });

    it('should return 500 when model returns "Error creating event"', async () => {
      req.body = { name: 'Test Event' };
      jest.spyOn(eventModel, 'insert').mockResolvedValue('Error creating event');

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });

    it('should return 500 on internal server error', async () => {
      req.body = { name: 'Test Event' };
      jest.spyOn(eventModel, 'insert').mockRejectedValue(new Error('Database connection error'));

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });
  });

  describe('getAllEvents', () => {
    beforeEach(() => {
      // Re-initializing req here to ensure specific values for this describe block
      req = {
        headers: {
          'user-agent': 'jest-test',
        },
        ip: '127.0.0.1',
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

    it('should return 404 when no events are found', async () => {
      jest.spyOn(eventModel, 'selectAll').mockResolvedValue('No events found');

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No events found' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(eventModel, 'selectAll').mockRejectedValue(new Error('Database error'));

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching events' });
    });
  });

  describe('getEventById', () => {
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