import express from "express";
import { validateInviteController } from "../Controllers/event_invite.controller.js";
import { validateTicketInviteController } from "../Controllers/ticket_invite.controller.js";


const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";

router.use(verifyToken);

router.get("/event/:token", validateInviteController);
router.get("/ticket/:token", validateTicketInviteController);


export default router;