// tests/eventRoutes.test.js
import request from "supertest";
import express from "express";
import eventRouter from "../../Routes/event-Route.js";

// Mock the controller functions
jest.mock("../../Controllers/event-Controller.js", () => ({
  createEvent: jest.fn((req, res) => res.status(201).json({ message: "Event created" })),
  getAllEvents: jest.fn((req, res) => res.json([{ id: 1, name: "Sample Event" }])),
  getEventById: jest.fn((req, res) => res.json({ id: req.params.id, name: "Event Details" })),
  updateEvent: jest.fn((req, res) => res.json({ message: "Event updated" })),
  deleteEvent: jest.fn((req, res) => res.json({ message: "Event deleted" })),
  searchEvents: jest.fn((req, res) => res.json([{ id: 1, name: "Search Result Event" }]))
}));

// Mock middleware (paginate, upload)
jest.mock("../../middleware/paginate.js", () => ({
  paginate: (req, res, next) => next()
}));

jest.mock("../../middleware/upload.js", () => ({
  fields: () => (req, res, next) => next()
}));

// Setup Express app with routes
const app = express();
app.use(express.json());
app.use("/events", eventRouter);

describe("Event Routes", () => {
  it("should create an event", async () => {
    const res = await request(app)
      .post("/events/createEvent")
      .send({ name: "Test Event" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Event created");
  });

  it("should get all events", async () => {
    const res = await request(app).get("/events/getAllEvents");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get event by id", async () => {
    const res = await request(app).get("/events/getEventById/123");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", "123");
  });

  it("should update an event", async () => {
    const res = await request(app)
      .put("/events/updateEvent")
      .send({ id: 1, name: "Updated Event" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Event updated");
  });

  it("should delete an event", async () => {
    const res = await request(app).delete("/events/deleteEvent/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Event deleted");
  });

  it("should search events", async () => {
    const res = await request(app).get("/events/searchEvents?query=test");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
