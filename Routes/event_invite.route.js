import express from "express";
import { validateInviteController } from "../Controllers/event_invite.controller.js";

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
import { paginate } from '../Middleware/paginate.js';

router.use(verifyToken);

router.get("/event/:token", validateInviteController);


export default router;