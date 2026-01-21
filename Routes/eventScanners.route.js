import express from "express";
import { createEventScannerController , getEventScannersByEventIdController , deleteEventScannerController} from "../Controllers/eventScanners.controller.js";

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
router.use(verifyToken);

router.post("/", createEventScannerController);
router.get("/event/:id", getEventScannersByEventIdController);
router.delete("/:id", deleteEventScannerController);

export default router;