import express from "express";
import { getEventStatsController , getTicketStatsController , getAttendeesByTicketIdController } from "../Controllers/OrganizerDashboard.controller.js" 

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
import { paginate } from '../Middleware/paginate.js';
router.use(verifyToken);

router.get("/events/:id", getEventStatsController);
router.get("/tickets/:id", getTicketStatsController);
router.get("/attendees/:id", paginate, getAttendeesByTicketIdController);

export default router;