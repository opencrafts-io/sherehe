import { 
  createAttendeeRepository,
  getAllAttendeesByEventIdRepository,
  deleteAttendeeRepository,
  getAttendeeByIdRepository,
  getAttendeesByUserIdRepository
} from "../Repositories/Attendee.repository.js";

import { logs } from "../Utils/logs.js"; 



export const createAttendeeController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { event_id, user_id } = req.body;

    if (!event_id || !user_id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing event_id or user_id", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const attendee = await createAttendeeRepository({ event_id, user_id });

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendee created", req.path, 201, req.headers["user-agent"]);

    res.status(201).json({
      message: "Attendee successfully registered for the event",
      attendee,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};



export const deleteAttendeeController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const attendeeId = req.params.id;

    if (!attendeeId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing attendee ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Attendee ID is required" });
    }

    const result = await deleteAttendeeRepository(attendeeId);

    if (!result) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Attendee not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Attendee not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendee soft-deleted", req.path, 200, req.headers["user-agent"]);

    res.status(200).json({ message: "Attendee deleted successfully" });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};



export const getAllAttendeesByEventIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;

    if (!eventId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing event ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Event ID is required" });
    }

    const attendees = await getAllAttendeesByEventIdRepository(eventId);

    if (!attendees || attendees.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "No attendees found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "No attendees found for this event" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendees retrieved", req.path, 200, req.headers["user-agent"]);

    res.status(200).json(attendees);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};



export const getAttendeesByIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const id = req.params.id;

    if (!id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing attendee ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Attendee ID is required" });
    }

    const attendee = await getAttendeeByIdRepository(id);

    if (!attendee) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "Attendee not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Attendee not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendee retrieved", req.path, 200, req.headers["user-agent"]);

    res.status(200).json(attendee);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};


export const getAttendeesByUserIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;

    const userId = req.user.sub;

    if (!eventId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing event ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Event ID is required" });
    }

    const attendees = await getAttendeesByUserIdRepository(eventId, userId);

    if (!attendees || attendees.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "No attendees found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "No attendees found for this event" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendees retrieved", req.path, 200, req.headers["user-agent"]);

    res.status(200).json(attendees);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};