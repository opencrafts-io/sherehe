import express from "express";
import { validateInviteController , createeventInviteController , deleteeventInviteController , getalleventInviteController } from "../Controllers/event_invite.controller.js";
import { validateTicketInviteController , createTicketInviteController , deleteTicketInviteController , getallTicketInviteController } from "../Controllers/ticket_invite.controller.js";


const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";

router.use(verifyToken);

router.get("/ticket/all/:id", getallTicketInviteController);
router.get("/event/all/:id", getalleventInviteController);
router.post("/event/", createeventInviteController);
router.delete("/event/:id", deleteeventInviteController);
router.get("/event/:token", validateInviteController);
router.get("/ticket/:token", validateTicketInviteController);
router.post("/ticket", createTicketInviteController);
router.delete("/ticket/:id", deleteTicketInviteController);



export default router;