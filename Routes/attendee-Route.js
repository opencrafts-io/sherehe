import { Router } from "express";
import { createAttendee , getAllAttendees , getAttendeeById , updateAttendee ,  patchAttendee, deleteAttendee } from "../Controller/attendee-Controller.js";

const router = Router();

router.post("/", createAttendee);
router.get("/", getAllAttendees);
router.get("/:id", getAttendeeById);
router.put("/:id", updateAttendee);
router.patch("/:id", patchAttendee)
router.delete("/delete/:id", deleteAttendee);

export default router;