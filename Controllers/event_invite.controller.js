import { 
  validateInviteRepository, 
  deleteeventInviteRepository,
  getalleventInviteRepository,
  createEventInviteRepository
  } from "../Repositories/event_invite.repository.js";

import { logs } from "../Utils/logs.js"; 
import crypto from "crypto";

export const validateInviteController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const  token = req.params.token

    if (!token) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing token", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Wrong Event Invite" });
    }

    const Event = await validateInviteRepository(token);

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Event invite validated", req.path, 201, req.headers["user-agent"]);

    res.status(201).json({
      message: "Event invite validated successfully",
      Event,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    if(error.message === "Invite expired" || error.message === "Invite limit reached" || error.message === "Invalid invite"){
      return res.status(400).json({ error: error.message });
    }else{
      return res.status(500).json({ error: error.message });
    }
  }
}


export const createeventInviteController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { event_id, expires_at , max_uses } = req.body;

    if (!event_id || !expires_at || !max_uses) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Missing required fields", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({
        error: "Missing required fields: event_id, expires_at, and max_uses are required.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await createEventInviteRepository({ event_id, expires_at , max_uses , token });

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "event invite created successfully", req.path, 201, req.headers["user-agent"]);

    return res.status(201).json({
      message: "event invite created successfully",
      url: `${req.protocol}://${req.get("host")}/invite/event/${token}`,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    return res.status(500).json({ error: error.message });
  }
}


export const deleteeventInviteController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const id = req.params.id

    if (!id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing id", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Wrong event Invite" });
    }

    const deleted = await deleteeventInviteRepository(id);

    if (!deleted) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "event invite not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "event invite not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "event invite deleted successfully", req.path, 204, req.headers["user-agent"]);

    return res.status(200).json(deleted);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
   if (error.message === "event invite not found") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Event already deleted") {
      return res.status(409).json({ error: error.message });
    }

    if (error.message.startsWith("Unauthorized")) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export const getalleventInviteController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const event_id = req.params.id;
    const invites = await getalleventInviteRepository(event_id);

    if (!invites) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "No invites found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "No invites found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Invites retrieved successfully", req.path, 200, req.headers["user-agent"]);

    return res.status(200).json(invites);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    return res.status(500).json({ error: error.message });
  }
}