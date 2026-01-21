import { logs } from "../Utils/logs.js";

import {
  createEventScannerRepository,
  getEventScannerByUserIdEventIdRepository,
  getEventScannerByEventIdRepository,
  deleteEventScannerRepository,
} from "../Repositories/eventScanners.repository.js";

export const createEventScannerController = async (req, res) => {
        const start = process.hrtime.bigint();
  try {
    const {event_id ,user_id} = req.body;
    const role = "SCANNER";
    const organizer_id = req.user.sub;
    // Verify orgainizer
    const orgainizer = await getEventScannerByUserIdEventIdRepository(
      organizer_id,
      event_id
    )
    if(!orgainizer || orgainizer.role !== "SUPERVISOR") {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "Not Authorized to add a scanner", req.path, 404, req.headers["user-agent"]);
      return res.status(403).json({ message: "Not Authorized to add a scanner" });
    }
    const scanner = await createEventScannerRepository(
      {
        event_id,
        user_id,
        role,
        granted_by: organizer_id,
      }
    );
        const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Event created successfully",
      req.originalUrl,
      201,
      req.headers["user-agent"]
    );
    return res.status(201).json(scanner);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    res.status(500).json({ error: error.message });
  }
};

export const getEventScannersByEventIdController = async (req, res) => {
        const start = process.hrtime.bigint();
  try {      
    const event_id = req.params.id;
    const scanner = await getEventScannerByEventIdRepository(event_id);
    const duration = Number(process.hrtime.bigint() - start) / 1000;

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Event Scanners fetched successfully",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    )
    return res.status(200).json(scanner);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    res.status(500).json({ error: error.message });
  }
};


export const deleteEventScannerController = async (req, res) => {
        const start = process.hrtime.bigint();
  try {      
    const event_id = req.params.id;
    const scanner = await deleteEventScannerRepository(event_id);
    const duration = Number(process.hrtime.bigint() - start) / 1000;

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Event Scanners deleted successfully",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    )
    return res.status(200).json({ message: "Event Scanners deleted successfully" });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    res.status(500).json({ error: error.message });
  }
};