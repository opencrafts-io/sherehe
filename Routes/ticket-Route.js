import { Router } from "express";
import { createTicket , getAllTickets , getTicketById , updateTicketFull, updateTicketPartial , deleteTicket } from "../Controller/ticket-Controller.js";

const router = Router();

router.post("/", createTicket);
router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicketFull);
router.patch("/:id", updateTicketPartial);
router.delete("/delete/:id", deleteTicket);

export default router;