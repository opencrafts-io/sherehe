import express from "express";
import cors from "cors";
import router from "./Routes/event-Route.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Welcome to Sherehe Backend");
});