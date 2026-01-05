import express from "express";
import {
  createEventController,
  getAllEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  searchEventController,
  getEventbyOrganizerIdController
} from "../Controllers/Event.controller.js";
import upload from '../Middleware/upload.js';

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
import { paginate } from '../Middleware/paginate.js';
// router.use(verifyToken);

router.get("/search", searchEventController);
router.post("/" ,
  upload.fields([
    { name: 'event_card_image', maxCount: 1 },
    { name: 'event_poster_image', maxCount: 1 },
    { name: 'event_banner_image', maxCount: 1 }
  ]), createEventController);
router.get("/", paginate, getAllEventsController);
router.get("/:id", getEventByIdController);
router.put("/:id", updateEventController);
router.delete("/:id", deleteEventController);
router.get("/organizer/:id", getEventbyOrganizerIdController);


export default router;