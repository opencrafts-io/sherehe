import express from "express";
import request from "supertest";
import router from "../../Routes/attendee-Route"; // adjust path as needed

// Mock all controller functions
jest.mock('../../Controllers/attendee-Controller.js', () => ({
  createAttendee: jest.fn((req, res) => res.status(201).send("createAttendee called")),
  getAllAttendeesByEventId: jest.fn((req, res) => res.send("getAllAttendeesByEventId called")),
  getAttendeeById: jest.fn((req, res) => res.send("getAttendeeById called")),
  updateAttendee: jest.fn((req, res) => res.send("updateAttendee called")),
  patchAttendee: jest.fn((req, res) => res.send("patchAttendee called")),
  deleteAttendee: jest.fn((req, res) => res.send("deleteAttendee called")),
}));

describe("Attendee Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/attendees", router);
  });

  it("POST /attendees calls createAttendee", async () => {
    const res = await request(app).post("/attendees").send({ name: "John" });
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe("createAttendee called");
  });

  it("GET /attendees/event/:id calls getAllAttendeesByEventId", async () => {
    const res = await request(app).get("/attendees/event/123");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("getAllAttendeesByEventId called");
  });

  it("GET /attendees/:id calls getAttendeeById", async () => {
    const res = await request(app).get("/attendees/456");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("getAttendeeById called");
  });

  it("PUT /attendees/:id calls updateAttendee", async () => {
    const res = await request(app).put("/attendees/789").send({ name: "Jane" });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("updateAttendee called");
  });

  it("PATCH /attendees/:id calls patchAttendee", async () => {
    const res = await request(app).patch("/attendees/101").send({ name: "Jack" });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("patchAttendee called");
  });

  it("DELETE /attendees/delete/:id calls deleteAttendee", async () => {
    const res = await request(app).delete("/attendees/delete/202");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("deleteAttendee called");
  });
});
