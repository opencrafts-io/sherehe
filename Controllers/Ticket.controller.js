import {
  createTicketRepository,
  getAllTicketsRepository,
  getTicketByIdRepository,
  updateTicketRepository,
  deleteTicketRepository,
  getTicketbyEventIdRepository,
} from '../Repositories/Ticket.repository.js';

import { logs } from '../Utils/logs.js';


// ===========================================================
// CREATE TICKET
// ===========================================================
export const createTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { event_id, ticket_name, ticket_price, ticket_quantity } = req.body;

    if (!event_id || !ticket_price || !ticket_quantity) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Missing required fields", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({
        error: "Missing required fields: event_id, ticket_price, and ticket_quantity are required.",
      });
    }

    const ticket = await createTicketRepository({
      event_id,
      ticket_name,
      ticket_price,
      ticket_quantity,
    });

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "Ticket created successfully", req.path, 201, req.headers["user-agent"]);

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method,
      error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};


// ===========================================================
// GET ALL TICKETS
// ===========================================================
export const getAllTicketsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const tickets = await getAllTicketsRepository();

    if (!tickets || tickets.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "No tickets found", req.path, 404, req.headers["user-agent"]);

      return res.status(404).json({
        message: [],
      });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "Tickets retrieved successfully", req.path, 200, req.headers["user-agent"]);

    res.status(200).json({
      message: "Tickets retrieved successfully",
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method,
      error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};


// ===========================================================
// GET TICKET BY ID
// ===========================================================
export const getTicketByIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const ticketId = req.params.id;

    if (!ticketId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Ticket ID is required", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({ error: "Ticket ID is required" });
    }

    const ticket = await getTicketByIdRepository(ticketId);

    if (!ticket) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Ticket not found", req.path, 404, req.headers["user-agent"]);

      return res.status(404).json({ error: "Ticket not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "Ticket retrieved successfully", req.path, 200, req.headers["user-agent"]);

    res.status(200).json({
      message: "Ticket retrieved successfully",
      ticket,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method,
      error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};


// ===========================================================
// UPDATE TICKET
// ===========================================================
export const updateTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const ticketId = req.params.id;
    const { ticket_name, ticket_price, ticket_quantity } = req.body;

    if (!ticketId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Ticket ID is required", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({ error: "Ticket ID is required" });
    }

    if (
      ticket_name === undefined &&
      ticket_price === undefined &&
      ticket_quantity === undefined
    ) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "No update fields provided", req.path, 422, req.headers["user-agent"]);

      return res.status(422).json({ error: "At least one field must be provided for update" });
    }

    const ticket = await updateTicketRepository(ticketId, {
      ticket_name,
      ticket_price,
      ticket_quantity,
    });

    if (!ticket) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Ticket not found", req.path, 404, req.headers["user-agent"]);

      return res.status(404).json({ error: "Ticket not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "Ticket updated successfully", req.path, 200, req.headers["user-agent"]);

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method,
      error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};


// ===========================================================
// DELETE TICKET
// ===========================================================
export const deleteTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const ticketId = req.params.id;
    const organizer_id = req.user.sub;

    if (!ticketId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Ticket ID is required", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({ error: "Ticket ID is required" });
    }

    const deleted = await deleteTicketRepository(ticketId, organizer_id);

    if (!deleted) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Ticket not found", req.path, 404, req.headers["user-agent"]);

      return res.status(404).json({ error: "Ticket not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "Ticket deleted successfully", req.path, 204, req.headers["user-agent"]);

    res.status(204).send();
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method,
      error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({
      error: "Failed to delete ticket",
      details: error.message,
    });
  }
};


// ===========================================================
// GET TICKET BY EVENT ID
// ===========================================================
export const getTicketByEventIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;

    if (!eventId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Event ID is required", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({ error: "Event ID is required" });
    }

    const tickets = await getTicketbyEventIdRepository(eventId);

    if (!tickets || tickets.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "No tickets found for event", req.path, 404, req.headers["user-agent"]);

      return res.status(404).json({ message: "No tickets found for this event" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method,
      "Tickets fetched by event ID", req.path, 200, req.headers["user-agent"]);

    res.status(200).json(tickets);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method,
      error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({
      error: "Failed to fetch tickets",
      details: error.message,
    });
  }
};
