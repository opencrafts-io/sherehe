import { Router } from "express";
import { createAttendee , getAllAttendeesByEventId , getAttendeeById , updateAttendee ,  patchAttendee, deleteAttendee } from "../Controllers/attendee-Controller.js";

const router = Router();

router.post("/", createAttendee);
router.get("/event/:id", getAllAttendeesByEventId);
router.get("/:id", getAttendeeById);
router.put("/:id", updateAttendee);
router.patch("/:id", patchAttendee)
router.delete("/delete/:id", deleteAttendee);

export default router;