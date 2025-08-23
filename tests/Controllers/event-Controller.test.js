// __tests__/eventController.test.js

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents,
} from "../../Controllers/event-Controller.js";

import { logs } from "../../utils/logs.js";
import sharp from "sharp";

// Mock dependencies
jest.mock("../../utils/logs.js");
jest.mock("sharp", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(),
  })),
}));

jest.mock("../../Model/event-Model.js", () => ({
  insert: jest.fn(),
  selectAll: jest.fn(),
  selectById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  search: jest.fn(),
}));

import {
  insert,
  selectAll,
  selectById,
  update,
  remove,
  search,
} from "../../Model/event-Model.js";

// Helpers
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ✅ Fixed mockRequest so it supports body, params, query, files, and pagination
const mockRequest = ({
  body = {},
  params = {},
  query = {},
  files = null,
  pagination = {},
} = {}) => ({
  body,
  params,
  query,
  files,
  pagination,
  headers: { "user-agent": "jest-test-runner" },
  ip: "127.0.0.1",
  method: "POST",
  url: "/test-url",
});

describe("Event Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // CREATE EVENT
  describe("createEvent", () => {
    it("should return 400 if files are missing", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Event card image, poster, and banner are required",
      });
    });

    it("should create an event successfully", async () => {
      const req = mockRequest({
        body: {
          name: "TechConf",
          description: "AI Conference",
          url: "https://conf.com",
          time: "10:00",
          date: "2025-09-01",
          location: "Nairobi",
          organizer: "Alice",
          organizer_id: "1",
          genre: "Tech",
        },
        files: {
          event_card_image: [{ path: "event.png" }],
          poster: [{ path: "poster.png" }],
          banner: [{ path: "banner.png" }],
        },
      });
      const res = mockResponse();

      insert.mockResolvedValue({});

      await createEvent(req, res);

      expect(insert).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Event created successfully",
      });
    });

    it("should return 500 if insert fails", async () => {
      const req = mockRequest({
        body: {
          name: "Fail Event",
          description: "test",
          url: "x",
          time: "10:00",
          date: "2025-09-01",
          location: "Y",
          organizer: "Bob",
          organizer_id: "2",
          genre: "Test",
        },
        files: {
          event_card_image: [{ path: "event.png" }],
          poster: [{ path: "poster.png" }],
          banner: [{ path: "banner.png" }],
        },
      });
      const res = mockResponse();

      insert.mockRejectedValue(new Error("DB error"));

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating event",
      });
    });
  });

  // GET ALL EVENTS
  describe("getAllEvents", () => {
    it("should return events with pagination", async () => {
      const req = mockRequest({
        pagination: { limit: 2, page: 1 },
      });
      const res = mockResponse();

      selectAll.mockResolvedValue([
        { id: "1", name: "Event1" },
        { id: "2", name: "Event2" },
        { id: "3", name: "Event3" },
      ]);

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        currentPage: 1,
        nextPage: 2,
        previousPage: null,
        data: [
          { id: "1", name: "Event1" },
          { id: "2", name: "Event2" },
        ],
      });
    });

    it("should return [] if no events", async () => {
      const req = mockRequest({ pagination: { limit: 2, page: 1 } });
      const res = mockResponse();

      selectAll.mockResolvedValue("No events found");

      await getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  // GET EVENT BY ID
  describe("getEventById", () => {
    it("should return event by ID", async () => {
      const req = mockRequest({ params: { id: "1" } });
      const res = mockResponse();

      selectById.mockResolvedValue({ id: "1", name: "Event1" });

      await getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        result: { id: "1", name: "Event1" },
      });
    });

    it("should return 404 if not found", async () => {
      const req = mockRequest({ params: { id: "999" } });
      const res = mockResponse();

      selectById.mockResolvedValue("Event not foundt");

      await getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // UPDATE EVENT
  describe("updateEvent", () => {
    it("should update event", async () => {
      const req = mockRequest({ body: { id: "1", name: "Updated" } });
      const res = mockResponse();

      update.mockResolvedValue({ id: "1", name: "Updated" });

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if not found", async () => {
      const req = mockRequest({ body: { id: "999" } });
      const res = mockResponse();

      update.mockResolvedValue("Event not found");

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // DELETE EVENT
  describe("deleteEvent", () => {
    it("should delete event", async () => {
      const req = mockRequest({ params: { id: "1" } });
      const res = mockResponse();

      remove.mockResolvedValue("Event deleted successfully");

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if not found", async () => {
      const req = mockRequest({ params: { id: "999" } });
      const res = mockResponse();

      remove.mockResolvedValue("Event not found");

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // SEARCH EVENTS
  describe("searchEvents", () => {
    it("should return search results", async () => {
      const req = mockRequest({ query: { searchQuery: "Tech" } });
      const res = mockResponse();

      search.mockResolvedValue([{ id: "1", name: "TechConf" }]);

      await searchEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: "1", name: "TechConf" }]);
    });

    it("should return empty array if no results", async () => {
      const req = mockRequest({ query: { searchQuery: "Unknown" } });
      const res = mockResponse();

      search.mockResolvedValue([]);

      await searchEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});
