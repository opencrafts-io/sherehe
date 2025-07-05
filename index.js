import express from "express";
import cors from "cors";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import eventRouter from "./Routes/event-Route.js";
import attendeeRouter from "./Routes/attendee-Route.js";
import ticketRouter from "./Routes/ticket-Route.js";

app.use("/events", eventRouter);
app.use("/attendees", attendeeRouter);
app.use("/tickets", ticketRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Welcome to Sherehe Backend");
});