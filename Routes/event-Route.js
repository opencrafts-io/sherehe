import { Router } from "express";
import { createEvent , getAllEvents , getEventById , updateEvent , deleteEvent } from "../Controller/event-Controller.js";

const router = Router();

router.post("createEvent", createEvent);
router.get("getAllEvents", getAllEvents);
router.get("getEventById", getEventById);
router.put("updateEvent", updateEvent);
router.delete("deleteEvent", deleteEvent);

export default router;