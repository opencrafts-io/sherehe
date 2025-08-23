import { Router } from "express";
import { createEvent , getAllEvents , getEventById , updateEvent , deleteEvent , searchEvents } from "../Controllers/event-Controller.js";
import { paginate } from '../middleware/paginate.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post(
  "/createEvent",
  upload.fields([
    { name: 'event_card_image', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  createEvent
);

router.get("/getAllEvents", paginate ,getAllEvents);
router.get("/getEventById/:id", getEventById);
router.put("/updateEvent", updateEvent);
router.delete("/deleteEvent/:id", deleteEvent);
router.get("/searchEvents", searchEvents);

export default router;