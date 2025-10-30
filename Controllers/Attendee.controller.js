import { createAttendeeRepository , getAllAttendeesByEventIdRepository, deleteAttendeeRepository , getAttendeeByIdRepository } from "../Repositories/Attendee.repository.js";

export const createAttendeeController = async (req, res) => {
  try {
    const { event_id, user_id } = req.body;

    // Validate required fields
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    // Create attendee record
    const attendee = await createAttendeeRepository({ event_id, user_id });

    // Successfully created (201: Created)
    res.status(201).json({
      message: "Attendee successfully registered for the event",
      attendee,
    });
  } catch (error) {
    // Internal Server Error (500)
    res.status(500).json({ error: error.message });
  }
};


export const deleteAttendeeController = async (req, res) => {
  try {
    const attendeeId = req.params.id;

    // Validate input
    if (!attendeeId) {
      return res.status(400).json({ error: "Attendee ID is required" });
    }

    // Soft delete attendee
    const result = await deleteAttendeeRepository(attendeeId);

    if (!result) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    // ✅ 200 OK since resource still exists, just marked deleted
    res.status(200).json({ message: "Attendee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getAllAttendeesByEventIdController = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Validate input
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const attendees = await getAllAttendeesByEventIdRepository(eventId);

    // No attendees found
    if (!attendees || attendees.length === 0) {
      return res.status(404).json({ message: "No attendees found for this event" });
    }

    res.status(200).json(attendees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendeesByIdController = async (req, res) => {
  try {
    const id =  req.params.id;

    // Validate input
    if (!id) {
      return res.status(400).json({ error: [] });
    }

    const attendee = await getAttendeeByIdRepository(id);

    if (!attendee) {
      return res.status(404).json({ message: "Attendee not found" });
    }

    res.status(200).json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

