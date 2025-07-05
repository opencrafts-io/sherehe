import {
  createAttendee,
  getAllAttendeesByEventId,
  getAttendeeById,
  updateAttendee,
  patchAttendee,
  deleteAttendee,
} from '../../Controllers/attendee-Controller.js';

import * as attendeeModel from '../../Model/attendee-Model.js';

describe('Attendee Controller', () => {
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

  describe('createAttendee', () => {
    it('should return 201 on successful creation', async () => {
      req.body = { name: 'John Doe' };
      jest.spyOn(attendeeModel, 'insert').mockResolvedValue('Attendee created successfully');

      await createAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee created successfully' });
    });

    it('should return 500 on known insert error', async () => {
      jest.spyOn(attendeeModel, 'insert').mockResolvedValue('Error creating attendee');

      await createAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating attendee' });
    });

    it('should return 500 on unknown insert response', async () => {
      jest.spyOn(attendeeModel, 'insert').mockResolvedValue('Some unknown response');

      await createAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getAllAttendeesByEventId', () => {
    it('should return 200 with attendees', async () => {
      const attendees = [{ id: 1 }];
      jest.spyOn(attendeeModel, 'selectAll').mockResolvedValue(attendees);

      await getAllAttendeesByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: attendees });
    });

    it('should return 404 if no attendees found', async () => {
      jest.spyOn(attendeeModel, 'selectAll').mockResolvedValue('No attendees found');

      await getAllAttendeesByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No attendees found' });
    });

    it('should return 500 on internal server error', async () => {
      jest.spyOn(attendeeModel, 'selectAll').mockResolvedValue('Internal server error');

      await getAllAttendeesByEventId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getAttendeeById', () => {
    it('should return 200 with attendee', async () => {
      req.params = { id: '1' };
      const attendee = { id: 1, name: 'Jane' };
      jest.spyOn(attendeeModel, 'selectById').mockResolvedValue(attendee);

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: attendee });
    });

    it('should return 404 if attendee not found', async () => {
      req.params = { id: '2' };
      jest.spyOn(attendeeModel, 'selectById').mockResolvedValue('Attendee not found');

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });

    it('should return 500 on internal error', async () => {
      jest.spyOn(attendeeModel, 'selectById').mockResolvedValue('Internal server error');

      await getAttendeeById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateAttendee', () => {
    it('should return 200 on full update success', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated' };
      const updated = { id: 1, name: 'Updated' };
      jest.spyOn(attendeeModel, 'updateFull').mockResolvedValue(updated);

      await updateAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Attendee updated successfully',
        data: updated,
      });
    });

    it('should return 404 if attendee not found for full update', async () => {
      jest.spyOn(attendeeModel, 'updateFull').mockResolvedValue(null);

      await updateAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });
  });

  describe('patchAttendee', () => {
    it('should return 200 on partial update success', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Partial' };
      const patched = { id: 1, name: 'Partial' };
      jest.spyOn(attendeeModel, 'updatePartial').mockResolvedValue(patched);

      await patchAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Attendee partially updated successfully',
        data: patched,
      });
    });

    it('should return 404 if attendee not found for patch', async () => {
      jest.spyOn(attendeeModel, 'updatePartial').mockResolvedValue(null);

      await patchAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });
  });

  describe('deleteAttendee', () => {
    it('should return 200 on delete success', async () => {
      req.params = { id: '1' };
      jest.spyOn(attendeeModel, 'remove').mockResolvedValue('Deleted');

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: 'Deleted' });
    });

    it('should return 404 if attendee not found', async () => {
      jest.spyOn(attendeeModel, 'remove').mockResolvedValue('Attendee not found');

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });

    it('should return 500 on internal error', async () => {
      jest.spyOn(attendeeModel, 'remove').mockResolvedValue('Internal server error');

      await deleteAttendee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
