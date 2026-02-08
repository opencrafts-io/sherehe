import express from "express";
import { createEventScannerController , getEventScannersByEventIdController , deleteEventScannerController , getEventScannerByUserIdEventIdController} from "../Controllers/eventScanners.controller.js";

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
import { paginate } from '../Middleware/paginate.js';

router.use(verifyToken);
router.post("/", createEventScannerController);
router.get("/event/:id", paginate, getEventScannersByEventIdController);
router.get("/user/:id", getEventScannerByUserIdEventIdController);
router.delete("/:id", deleteEventScannerController);

export default router;