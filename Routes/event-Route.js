import { Router } from "express";
import { createEvent } from "../Controller/event-Controller.js";

const router = Router();

router.get("/", createEvent);

export default router;