import express from "express";
import request from "supertest";
import router from "../../Routes/event-Route.js"; // adjust path as needed

// Mock event controller functions
jest.mock("../../Controllers/event-Controller.js", () => ({
  createEvent: jest.fn((req, res) => res.status(201).send("createEvent called")),
  getAllEvents: jest.fn((req, res) => res.send("getAllEvents called")),
  getEventById: jest.fn((req, res) => res.send("getEventById called")),
  updateEvent: jest.fn((req, res) => res.send("updateEvent called")),
  deleteEvent: jest.fn((req, res) => res.send("deleteEvent called")),
}));

describe("Event Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/events", router);
  });

  it("POST /events/createEvent calls createEvent", async () => {
    const res = await request(app).post("/events/createEvent").send({ name: "New Event" });
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe("createEvent called");
  });

  it("GET /events/getAllEvents calls getAllEvents", async () => {
    const res = await request(app).get("/events/getAllEvents");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("getAllEvents called");
  });

  it("GET /events/getEventById/:id calls getEventById", async () => {
    const res = await request(app).get("/events/getEventById/123");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("getEventById called");
  });

  it("PUT /events/updateEvent calls updateEvent", async () => {
    const res = await request(app).put("/events/updateEvent").send({ id: 123, name: "Updated Event" });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("updateEvent called");
  });

  it("DELETE /events/deleteEvent/:id calls deleteEvent", async () => {
    const res = await request(app).delete("/events/deleteEvent/456");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("deleteEvent called");
  });
});
