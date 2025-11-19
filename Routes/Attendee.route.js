import express from "express";
import {
  createAttendeeController,
  getAttendeesByIdController,
  deleteAttendeeController,
  getAllAttendeesByEventIdController,
  getAttendeesByUserIdController
} from "../Controllers/Attendee.controller.js";

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
router.use(verifyToken);

router.post("/", createAttendeeController);
router.get("/user/:id", getAttendeesByUserIdController);
router.get("/event/:id", getAllAttendeesByEventIdController);
router.get("/:id", getAttendeesByIdController);
router.delete("/:id", deleteAttendeeController);

export default router;