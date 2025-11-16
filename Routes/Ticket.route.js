import express from "express";
import {
  createTicketController,
  getTicketByEventIdController,
  getTicketByIdController,
  updateTicketController,
  deleteTicketController,
} from "../Controllers/Ticket.controller.js";

const router = express.Router();
import {verifyToken} from "../Middleware/jwt_token_verification.js";

router.use(verifyToken);

router.post("/", createTicketController);
// router.get("/", getAllTicketsController);
router.get("/event/:id", getTicketByEventIdController);
router.get("/:id", getTicketByIdController);
router.put("/:id", updateTicketController);
router.delete("/:id", deleteTicketController);

export default router;