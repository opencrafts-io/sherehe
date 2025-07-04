import { Router } from "express";
import { createTicket , getAllTickets , getTicketById , updateTicket , deleteTicket } from "../Controller/ticket-Controller.js";

const router = Router();

router.post("/", createTicket);
router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/delete/:id", deleteTicket);

export default router;