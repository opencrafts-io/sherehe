import { Router } from "express";
import { createTicket , getAllTicketsByAttendeeId , getTicketByEventId , updateTicketFull, updateTicketPartial , deleteTicket } from "../Controllers/ticket-Controller.js";
import { paginate } from '../middleware/paginate.js';

const router = Router();

router.post("/", createTicket);
router.get("/attendee/:id", paginate ,getAllTicketsByAttendeeId);
router.get("/:id", getTicketByEventId);
router.put("/:id", updateTicketFull);
router.patch("/:id", updateTicketPartial);
router.delete("/delete/:id", deleteTicket);

export default router;