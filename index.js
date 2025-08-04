import express from "express";
import cors from "cors";
const app = express();

import dotenv from "dotenv";
import path from "path";
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

app.listen(process.env.PORT, () => {
  console.log("Welcome to Sherehe Backend");
});