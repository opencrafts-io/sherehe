import express from "express";
import cors from "cors";
import router from "./Routes/event-Route.js";
import attendeeRouter from "./Routes/attendee-Route.js";
import ticketRouter from "./Routes/ticket-Route.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", router);
app.use("/attendees", attendeeRouter);
app.use("/tickets", ticketRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Welcome to Sherehe Backend");
});