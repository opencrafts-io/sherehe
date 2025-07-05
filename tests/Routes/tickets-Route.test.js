import express from "express";
import request from "supertest";
import router from "../../Routes/ticket-Route.js";

// Mock ticket controller functions
jest.mock("../../Controllers/ticket-Controller.js", () => ({
  createTicket: jest.fn((req, res) => res.status(201).send("createTicket called")),
  getAllTicketsByAttendeeId: jest.fn((req, res) => res.send("getAllTicketsByAttendeeId called")),
  getTicketByEventId: jest.fn((req, res) => res.send("getTicketByEventId called")),
  updateTicketFull: jest.fn((req, res) => res.send("updateTicketFull called")),
  updateTicketPartial: jest.fn((req, res) => res.send("updateTicketPartial called")),
  deleteTicket: jest.fn((req, res) => res.send("deleteTicket called")),
}));

describe("Ticket Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/tickets", router);
  });

  it("POST /tickets/ calls createTicket", async () => {
    const res = await request(app).post("/tickets/").send({ attendeeid: 1, eventid: 2, paymentcode: "abc123" });
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe("createTicket called");
  });

  it("GET /tickets/attendee/:id calls getAllTicketsByAttendeeId", async () => {
    const res = await request(app).get("/tickets/attendee/1");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("getAllTicketsByAttendeeId called");
  });

  it("GET /tickets/:id calls getTicketByEventId", async () => {
    const res = await request(app).get("/tickets/5");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("getTicketByEventId called");
  });

  it("PUT /tickets/:id calls updateTicketFull", async () => {
    const res = await request(app).put("/tickets/5").send({ attendeeid: 1, eventid: 2, paymentcode: "xyz789" });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("updateTicketFull called");
  });

  it("PATCH /tickets/:id calls updateTicketPartial", async () => {
    const res = await request(app).patch("/tickets/5").send({ paymentcode: "partialUpdate" });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("updateTicketPartial called");
  });

  it("DELETE /tickets/delete/:id calls deleteTicket", async () => {
    const res = await request(app).delete("/tickets/delete/5");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("deleteTicket called");
  });
});
