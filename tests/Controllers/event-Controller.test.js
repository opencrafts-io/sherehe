import request from 'supertest';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import * as model from '../../Model/event-Model.js';
import * as logger from '../../utils/logs.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEventsController // ✅ Import added
} from '../../Controllers/event-Controller.js';

// Setup Express app
const app = express();
app.use(express.json());

// Mock pagination middleware
app.use((req, res, next) => {
  req.pagination = { limit: 10, page: 1 };
  next();
});

// Configure multer for memory storage (simulate file upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define routes
app.post('/events', upload.single('file'), createEvent);
app.get('/events', getAllEvents);
app.get('/events/search', searchEventsController); // ✅ Added route
app.get('/events/:id', getEventById);
app.put('/events', updateEvent);
app.delete('/events/:id', deleteEvent);

// Mock logs
jest.spyOn(logger, 'logs').mockResolvedValue();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Event Controller', () => {
  describe('POST /events (createEvent)', () => {
    it('should create an event successfully', async () => {
      process.env.BASE_URL = 'http://localhost:3000';
      jest.spyOn(model, 'insert').mockResolvedValue('Event created successfully');

      const response = await request(app)
        .post('/events')
        .field('name', 'Test Event')
        .field('description', 'This is a test')
        .field('url', 'http://test.com')
        .field('time', '12:00 PM')
        .field('date', '2025-12-01')
        .field('location', 'Nairobi')
        .field('organizer', 'Tester')
        .field('organizer_id', '123')
        .field('genre', 'Tech')
        .attach('file', Buffer.from('dummy image'), 'test.jpg');

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should return 400 if no image uploaded', async () => {
      const response = await request(app)
        .post('/events')
        .send({
          name: 'No Image Event'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('No image uploaded');
    });

    it('should return 500 on insert error', async () => {
      jest.spyOn(model, 'insert').mockResolvedValue('Error creating event');

      const response = await request(app)
        .post('/events')
        .field('name', 'Error Event')
        .field('description', 'Error test')
        .field('url', 'http://test.com')
        .field('time', '12:00 PM')
        .field('date', '2025-12-01')
        .field('location', 'Nairobi')
        .field('organizer', 'Tester')
        .field('organizer_id', '123')
        .field('genre', 'Tech')
        .attach('file', Buffer.from('dummy image'), 'test.jpg');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Error creating event');
    });

    it('should return 500 on controller crash', async () => {
      jest.spyOn(model, 'insert').mockRejectedValue(new Error('Crash'));

      const response = await request(app)
        .post('/events')
        .field('name', 'Crash Event')
        .field('description', 'Crash')
        .field('url', 'http://test.com')
        .field('time', '12:00 PM')
        .field('date', '2025-12-01')
        .field('location', 'Nairobi')
        .field('organizer', 'Tester')
        .field('organizer_id', '123')
        .field('genre', 'Tech')
        .attach('file', Buffer.from('dummy image'), 'test.jpg');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Error creating event');
    });
  });

  describe('GET /events (getAllEvents)', () => {
    it('should return events with pagination', async () => {
      const mockEvents = Array(5).fill({ name: 'Event A' });
      jest.spyOn(model, 'selectAll').mockResolvedValue(mockEvents);

      const response = await request(app).get('/events');

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.currentPage).toBe(1);
    });

    it('should return 200 with empty array if no events', async () => {
      jest.spyOn(model, 'selectAll').mockResolvedValue('No events found');

      const response = await request(app).get('/events');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /events/:id (getEventById)', () => {
    it('should return event by ID', async () => {
      jest.spyOn(model, 'selectById').mockResolvedValue({ id: '123', name: 'Event' });

      const response = await request(app).get('/events/123');

      expect(response.statusCode).toBe(200);
      expect(response.body.result.name).toBe('Event');
    });

    it('should return 404 if event not found', async () => {
      jest.spyOn(model, 'selectById').mockResolvedValue('Event not foundt');

      const response = await request(app).get('/events/999');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Error fetching event');
    });
  });

  describe('PUT /events (updateEvent)', () => {
    it('should update event successfully', async () => {
      jest.spyOn(model, 'update').mockResolvedValue('Event updated successfully');

      const response = await request(app).put('/events').send({ id: '1', name: 'Updated Event' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Event updated successfully');
    });

    it('should return 404 if event not found', async () => {
      jest.spyOn(model, 'update').mockResolvedValue('Event not found');

      const response = await request(app).put('/events').send({ id: 'not_exist' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Event not found for update');
    });
  });

  describe('DELETE /events/:id (deleteEvent)', () => {
    it('should delete event successfully', async () => {
      jest.spyOn(model, 'remove').mockResolvedValue('Event deleted successfully');

      const response = await request(app).delete('/events/123');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Event deleted successfully');
    });

    it('should return 404 if event not found', async () => {
      jest.spyOn(model, 'remove').mockResolvedValue('Event not found');

      const response = await request(app).delete('/events/999');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Event not found for deletion');
    });
  });

  describe('GET /events/search (searchEventsController)', () => {
    it('should return events matching the search query', async () => {
      const mockResults = [
        { id: 1, name: 'Dani Diaz Live Show', genre: 'Music' }
      ];
      jest.spyOn(model, 'searchEvents').mockResolvedValue(mockResults);

      const res = await request(app).get('/events/search?q=dani diaz');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockResults);
      expect(model.searchEvents).toHaveBeenCalledWith('dani diaz');
    });

    it('should return 400 if query param is missing', async () => {
      const res = await request(app).get('/events/search');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Search query is required');
    });

    it('should return 500 if searchEvents throws an error', async () => {
      jest.spyOn(model, 'searchEvents').mockRejectedValue(new Error('DB fail'));

      const res = await request(app).get('/events/search?q=dani diaz');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error searching events');
    });
  });
});
