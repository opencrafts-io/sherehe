import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from "../../Controllers/event-Controller.js";
import * as eventModel from '../../Model/event-Model.js';

describe('Event Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should return 200 on successful insert', async () => {
      req.body = { name: 'Test Event' };
      jest.spyOn(eventModel, 'insert').mockResolvedValue('Success');

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event created successfully' });
    });

    it('should return 500 on insert error response', async () => {
      req.body = { name: 'Test Event' };
      jest.spyOn(eventModel, 'insert').mockResolvedValue('Error creating event');

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });
  });

  describe('getAllEvents', () => {
    it('should return 200 with events', async () => {
      const fakeEvents = [{ id: 1 }];
      jest.spyOn(eventModel, 'selectAll').mockResolvedValue(fakeEvents);

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: fakeEvents });
    });

    it('should return 500 on fetch error', async () => {
      jest.spyOn(eventModel, 'selectAll').mockResolvedValue('Error fetching events');

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

    it('should return 500 on fetch error', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'selectById').mockResolvedValue('Error fetching event');

      await getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching event' });
    });
  });

  describe('updateEvent', () => {
    it('should return 200 on success', async () => {
      req.body = { id: 1, name: 'Updated' };
      jest.spyOn(eventModel, 'update').mockResolvedValue('Success');

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event updated successfully' });
    });

    it('should return 500 on update error', async () => {
      req.body = { id: 1 };
      jest.spyOn(eventModel, 'update').mockResolvedValue('Error updating event');

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating event' });
    });
  });

  describe('deleteEvent', () => {
    it('should return 200 on success', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'remove').mockResolvedValue('Success');

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event deleted successfully' });
    });

    it('should return 500 on delete error', async () => {
      req.params = { id: 1 };
      jest.spyOn(eventModel, 'remove').mockResolvedValue('Error deleting event');

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting event' });
    });
  });
});
