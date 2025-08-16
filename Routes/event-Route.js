import { Router } from "express";
import { createEvent , getAllEvents , getEventById , updateEvent , deleteEvent , searchEventsController} from "../Controllers/event-Controller.js";
import { paginate } from '../middleware/paginate.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post("/createEvent", upload.single('image'), createEvent);
router.get("/getAllEvents", paginate ,getAllEvents);
router.get("/getEventById/:id", getEventById);
router.put("/updateEvent", updateEvent);
router.delete("/deleteEvent/:id", deleteEvent);
router.get("/search", searchEventsController);

export default router;