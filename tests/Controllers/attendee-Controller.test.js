import { createAttendee, getAllAttendeesByEventId, getAttendeeById, updateAttendee, patchAttendee, deleteAttendee } from "../../Controllers/attendee-Controller.js";
import * as attendeeModel from '../../Model/attendee-Model.js';

describe('Attendee Controller', () => {
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

  describe('createAttendee', () => {
    it('should return 201 on successful creation', async () => {
      req.body = { firstname: 'John', lastname: 'Doe', eventid: 1 };
      jest.spyOn(attendeeModel, 'insert').mockResolvedValue('Attendee created successfully');

      await createAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee created successfully' });
    });

    it('should return 500 when model returns "Error creating attendee"', async () => {
      req.body = { firstname: 'John', lastname: 'Doe', eventid: 1 };
      jest.spyOn(attendeeModel, 'insert').mockResolvedValue('Error creating attendee');

      await createAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating attendee' });
    });

    it('should return 500 on internal server error', async () => {
      req.body = { firstname: 'John', lastname: 'Doe', eventid: 1 };
      jest.spyOn(attendeeModel, 'insert').mockRejectedValue(new Error('Database error'));

      await createAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating attendee' });
    });
  });

  describe('getAllAttendeesByEventId', () => {
    beforeEach(() => {
      req.params = { eventId: 1 };
      req.pagination = {
        page: 1,
        limit: 10,
        offset: 0,
        limitPlusOne: 11,
      };
    });

    it('should return 200 with attendees when found', async () => {
      const fakeAttendees = [{ id: 1, eventid: 1 }, { id: 2, eventid: 1 }];
      jest.spyOn(attendeeModel, 'selectAll').mockResolvedValue(fakeAttendees);

      await getAllAttendeesByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        data: fakeAttendees
      });
    });

    it('should return 404 when no attendees are found', async () => {
      jest.spyOn(attendeeModel, 'selectAll').mockResolvedValue('No attendees found');

      await getAllAttendeesByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No attendees found for event' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(attendeeModel, 'selectAll').mockRejectedValue(new Error('Database connection error'));

      await getAllAttendeesByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching attendees' });
    });
  });

  describe('getAttendeeById', () => {
    it('should return 200 with attendee data when found', async () => {
      req.params = { id: 1 };
      const fakeAttendee = [{ id: 1, firstname: 'Jane' }];
      jest.spyOn(attendeeModel, 'selectById').mockResolvedValue(fakeAttendee);

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: fakeAttendee });
    });

    it('should return 404 when attendee not found', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'selectById').mockResolvedValue('Attendee not found');

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found by ID' });
    });

    it('should return 500 when model returns "Internal server error"', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'selectById').mockResolvedValue('Internal server error');

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 500 on other internal server error', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'selectById').mockRejectedValue(new Error('Query failed'));

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching attendee' });
    });
  });

  describe('updateAttendee', () => {
    it('should return 200 on successful full update', async () => {
      req.params = { id: 1 };
      req.body = { firstname: 'Updated', lastname: 'User', eventid: 1 };
      const updatedAttendeeData = { id: 1, ...req.body };
      jest.spyOn(attendeeModel, 'updateFull').mockResolvedValue(updatedAttendeeData);

      await updateAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Attendee updated successfully',
        data: updatedAttendeeData,
      });
    });

    it('should return 404 when attendee not found for full update', async () => {
      req.params = { id: 1 };
      req.body = { firstname: 'Updated', lastname: 'User', eventid: 1 };
      jest.spyOn(attendeeModel, 'updateFull').mockResolvedValue(null);

      await updateAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found for full update' });
    });

    it('should return 500 on internal server error during full update', async () => {
      req.params = { id: 1 };
      req.body = { firstname: 'Updated', lastname: 'User', eventid: 1 };
      jest.spyOn(attendeeModel, 'updateFull').mockRejectedValue(new Error('DB error'));

      await updateAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating attendee' });
    });
  });

  describe('patchAttendee', () => {
    it('should return 200 on successful partial update', async () => {
      req.params = { id: 1 };
      req.body = { firstname: 'Patched' };
      const patchedAttendeeData = { id: 1, firstname: 'Patched', lastname: 'Doe', eventid: 1 };
      jest.spyOn(attendeeModel, 'updatePartial').mockResolvedValue(patchedAttendeeData);

      await patchAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Attendee partially updated successfully',
        data: patchedAttendeeData,
      });
    });

    it('should return 404 when attendee not found for partial update', async () => {
      req.params = { id: 1 };
      req.body = { firstname: 'Patched' };
      jest.spyOn(attendeeModel, 'updatePartial').mockResolvedValue(null);

      await patchAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found for partial update' });
    });

    it('should return 500 on internal server error during partial update', async () => {
      req.params = { id: 1 };
      req.body = { firstname: 'Patched' };
      jest.spyOn(attendeeModel, 'updatePartial').mockRejectedValue(new Error('Validation error'));

      await patchAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating attendee' });
    });
  });

  describe('deleteAttendee', () => {
    it('should return 200 on successful deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'remove').mockResolvedValue('Attendee deleted successfully');

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: 'Attendee deleted successfully' });
    });

    it('should return 404 when attendee not found for deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'remove').mockResolvedValue('Attendee not found');

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found for deletion' });
    });

    it('should return 500 when model returns "Internal server error" for deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'remove').mockResolvedValue('Internal server error');

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 500 on other internal server error during deletion', async () => {
      req.params = { id: 1 };
      jest.spyOn(attendeeModel, 'remove').mockRejectedValue(new Error('DB constraint error'));

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting attendee' });
    });
  });
});