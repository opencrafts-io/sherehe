import { Router } from "express";
import { createEvent , getAllEvents , getEventById , updateEvent , deleteEvent } from "../Controllers/event-Controller.js";

const router = Router();

router.post("/createEvent", createEvent);
router.get("/getAllEvents", getAllEvents);
router.get("/getEventById/:id", getEventById);
router.put("/updateEvent", updateEvent);
router.delete("/deleteEvent/:id", deleteEvent);

export default router;