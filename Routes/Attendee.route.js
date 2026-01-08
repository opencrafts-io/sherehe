import express from "express";
import {
  createAttendeeController,
  getAttendeesByIdController,
  deleteAttendeeController,
  getAllAttendeesByEventIdController,
  getAttendeesByUserIdController,
  getUserAttendedEventsController,
  searchAttendeesByEventNameTicketNameController,
  getAllUserAttendedSpecificEventsController
} from "../Controllers/Attendee.controller.js";

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
import { paginate } from '../Middleware/paginate.js';
router.use(verifyToken);

router.get("/search" , paginate, searchAttendeesByEventNameTicketNameController);
router.post("/", createAttendeeController);
router.get("/user/attended", paginate, getUserAttendedEventsController);
router.post("/user/", paginate, getAttendeesByUserIdController);
router.get("/event/user/:id", paginate, getAllUserAttendedSpecificEventsController);
router.get("/event/:id", paginate, getAllAttendeesByEventIdController);
router.get("/:id", getAttendeesByIdController);
router.delete("/:id", deleteAttendeeController);



export default router;