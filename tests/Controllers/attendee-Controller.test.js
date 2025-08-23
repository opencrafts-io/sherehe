import request from "supertest";
import express from "express";
import * as model from "../../Model/attendee-Model.js";
import * as logger from "../../utils/logs.js";
import {
  createAttendee,
  getAllAttendeesByEventId,
  getAttendeeById,
  updateAttendee,
  patchAttendee,
  deleteAttendee
} from "../../Controllers/attendee-Controller.js";

const app = express();
app.use(express.json());

// Middleware to mock pagination
app.use((req, res, next) => {
  req.pagination = { limit: 10, page: 1 };
  next();
});

// Attach routes
app.post("/attendees", createAttendee);
app.get("/attendees/event/:eventId", getAllAttendeesByEventId);
app.get("/attendees/:id", getAttendeeById);
app.put("/attendees/:id", updateAttendee);
app.patch("/attendees/:id", patchAttendee);
app.delete("/attendees/:id", deleteAttendee);

// Mock the logs function
jest.spyOn(logger, "logs").mockResolvedValue();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe("Attendee Controller", () => {
  describe("POST /attendees", () => {
    it("should create attendee successfully", async () => {
      jest.spyOn(model, "insert").mockResolvedValue("Attendee created successfully");

      const response = await request(app).post("/attendees").send({ name: "John Doe" });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Attendee created successfully");
    });

    it("should return 400 for missing fields", async () => {
      jest.spyOn(model, "insert").mockResolvedValue("Error creating attendee");

      const response = await request(app).post("/attendees").send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Missing required fields");
    });

    it("should handle internal error", async () => {
      jest.spyOn(model, "insert").mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/attendees").send({ name: "John" });

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe("Error creating attendee");
    });
  });

  describe("GET /attendees/event/:eventId", () => {
    it("should return attendees with pagination", async () => {
      const attendees = Array(5).fill({ name: "Jane Doe" });
      jest.spyOn(model, "selectAll").mockResolvedValue(attendees);

      const response = await request(app).get("/attendees/event/123");

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(5);
    });

    it("should return 404 if no attendees", async () => {
      jest.spyOn(model, "selectAll").mockResolvedValue("No attendees found");

      const response = await request(app).get("/attendees/event/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("No attendees found for event");
    });
  });

  describe("GET /attendees/:id", () => {
    it("should return attendee by ID", async () => {
      jest.spyOn(model, "selectById").mockResolvedValue({ id: "abc123", name: "Jane" });

      const response = await request(app).get("/attendees/abc123");

      expect(response.statusCode).toBe(200);
      expect(response.body.result.name).toBe("Jane");
    });

    it("should return 404 if attendee not found", async () => {
      jest.spyOn(model, "selectById").mockResolvedValue("Attendee not found");

      const response = await request(app).get("/attendees/unknown");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Attendee not found by ID");
    });
  });

  describe("PUT /attendees/:id", () => {
    it("should update attendee fully", async () => {
      jest.spyOn(model, "updateFull").mockResolvedValue({ id: "abc123", name: "Updated" });

      const response = await request(app).put("/attendees/abc123").send({ name: "Updated" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Attendee updated successfully");
    });

    it("should return 404 if attendee not found", async () => {
      jest.spyOn(model, "updateFull").mockResolvedValue(null);

      const response = await request(app).put("/attendees/unknown").send({ name: "Fail" });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Attendee not found for full update");
    });
  });

  describe("PATCH /attendees/:id", () => {
    it("should patch attendee successfully", async () => {
      jest.spyOn(model, "updatePartial").mockResolvedValue({ id: "abc123", name: "Partially Updated" });

      const response = await request(app).patch("/attendees/abc123").send({ name: "Partially Updated" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Attendee partially updated successfully");
    });

    it("should return 404 if patching non-existent attendee", async () => {
      jest.spyOn(model, "updatePartial").mockResolvedValue(null);

      const response = await request(app).patch("/attendees/none").send({});

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Attendee not found for partial update");
    });
  });

  describe("DELETE /attendees/:id", () => {
    it("should delete attendee", async () => {
      jest.spyOn(model, "remove").mockResolvedValue("Attendee deleted successfully");

      const response = await request(app).delete("/attendees/abc123");

      expect(response.statusCode).toBe(200);
      expect(response.body.result).toBe("Attendee deleted successfully");
    });

    it("should return 404 if attendee not found", async () => {
      jest.spyOn(model, "remove").mockResolvedValue("Attendee not found");

      const response = await request(app).delete("/attendees/notfound");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Attendee not found for deletion");
    });
  });
});
