import {
  createAttendee,
  getAllAttendees,
  getAttendeeById,
  updateAttendee,
  patchAttendee,
  deleteAttendee,
} from '../../Controller/attendee-Controller.js';

import {
  insert,
  selectAll,
  selectById,
  updateFull,
  updatePartial,
  remove,
} from '../../Model/attendee-Model.js';

jest.mock('../../Model/attendee-Model.js');

describe('Attendee Controller', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAttendee', () => {
    it('should return 201 and created attendee', async () => {
      const mockAttendee = { id: 1, firstname: 'Jane' };
      const mockReq = { body: mockAttendee };
      insert.mockResolvedValue(mockAttendee);

      await createAttendee(mockReq, mockRes);

      expect(insert).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Attendee created successfully',
        attendee: mockAttendee,
      });
    });

    it('should handle errors and return 500', async () => {
      insert.mockRejectedValue(new Error('DB error'));

      await createAttendee({ body: {} }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error creating attendee' });
    });
  });

  describe('getAllAttendees', () => {
    it('should return 200 and all attendees', async () => {
      const mockData = [{ id: 1, firstname: 'John' }];
      selectAll.mockResolvedValue(mockData);

      await getAllAttendees({}, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Attendees fetched successfully',
        data: mockData,
      });
    });

    it('should handle errors and return 500', async () => {
      selectAll.mockRejectedValue(new Error('Error'));

      await getAllAttendees({}, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error fetching attendees' });
    });
  });

  describe('getAttendeeById', () => {
    it('should return 200 with attendee if found', async () => {
      const mockAttendee = { id: 1, firstname: 'Jane' };
      const mockReq = { params: { id: 1 } };
      selectById.mockResolvedValue(mockAttendee);

      await getAttendeeById(mockReq, mockRes);

      expect(selectById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Attendee fetched successfully',
        data: mockAttendee,
      });
    });

    it('should return 404 if attendee not found', async () => {
      const mockReq = { params: { id: 999 } };
      selectById.mockResolvedValue(null);

      await getAttendeeById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Attendee not found' });
    });

    it('should return 500 on error', async () => {
      selectById.mockRejectedValue(new Error());

      await getAttendeeById({ params: { id: 1 } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error fetching attendee' });
    });
  });

  describe('updateAttendee', () => {
    it('should update and return attendee', async () => {
      const updated = { id: 1, firstname: 'Updated' };
      const mockReq = { params: { id: 1 }, body: updated };
      updateFull.mockResolvedValue(updated);

      await updateAttendee(mockReq, mockRes);

      expect(updateFull).toHaveBeenCalledWith(1, updated);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Attendee updated successfully',
        data: updated,
      });
    });

    it('should return 404 if attendee not found', async () => {
      updateFull.mockResolvedValue(null);
      const mockReq = { params: { id: 999 }, body: {} };

      await updateAttendee(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });

    it('should return 500 on error', async () => {
      updateFull.mockRejectedValue(new Error());
      const mockReq = { params: { id: 1 }, body: {} };

      await updateAttendee(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error updating attendee' });
    });
  });

  describe('patchAttendee', () => {
    it('should return 200 if partial update works', async () => {
      const updated = { id: 1, firstname: 'Partial' };
      const mockReq = { params: { id: 1 }, body: { firstname: 'Partial' } };
      updatePartial.mockResolvedValue(updated);

      await patchAttendee(mockReq, mockRes);

      expect(updatePartial).toHaveBeenCalledWith(1, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Attendee partially updated successfully',
        data: updated,
      });
    });

    it('should return 404 if not found', async () => {
      updatePartial.mockResolvedValue(null);
      const mockReq = { params: { id: 999 }, body: {} };

      await patchAttendee(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });

    it('should return 500 on error', async () => {
      updatePartial.mockRejectedValue(new Error());

      await patchAttendee({ params: { id: 1 }, body: {} }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error updating attendee' });
    });
  });

  describe('deleteAttendee', () => {
    it('should return 200 when deleted', async () => {
      const mockReq = { params: { id: 1 } };
      remove.mockResolvedValue(true);

      await deleteAttendee(mockReq, mockRes);

      expect(remove).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Attendee deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      remove.mockResolvedValue(false);
      const mockReq = { params: { id: 999 } };

      await deleteAttendee(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Attendee not found' });
    });

    it('should return 500 on error', async () => {
      remove.mockRejectedValue(new Error());

      await deleteAttendee({ params: { id: 1 } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error deleting attendee' });
    });
  });
});
