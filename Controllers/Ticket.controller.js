import {
  createTicketRepository,
  getAllTicketsRepository,
  getTicketByIdRepository,
  updateTicketRepository,
  deleteTicketRepository,
  getTicketbyEventIdRepository,
} from '../Repositories/Ticket.repository.js';

import { logs } from '../Utils/logs.js';
import {getAllUserInstitutionRepository} from '../Repositories/user_institution.repository.js';
import {getEventByIdRepository} from '../Repositories/Event.repository.js';

export const createTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  const logRequest = (level, message, status) => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6; // Converted to milliseconds for standard precision
    logs(duration, level, req.ip, req.method, message, req.path, status, req.headers["user-agent"]);
  };

  try {
    const { event_id, ticket_name, ticket_price, ticket_quantity, ticket_for, start_date, end_date, scope , institutions } = req.body;


    if (!event_id || ticket_price === undefined || ticket_quantity === undefined || !ticket_for || !start_date || !end_date || !scope) {
      logRequest("WARN", "Missing required fields", 400);
      return res.status(400).json({
        error: "Missing required fields: event_id, ticket_price, ticket_quantity, ticket_for, start_date, end_date, and scope are required.",
      });
    }


    const event = await getEventByIdRepository(event_id);
    if (!event) {
      logRequest("WARN", `Event not found with ID: ${event_id}`, 404);
      return res.status(404).json({ error: "The associated event does not exist." });
    }


    const ticketStart = new Date(start_date);
    const ticketEnd = new Date(end_date);
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);

    if (ticketStart < eventStart) {
      logRequest("WARN", "Ticket starts before event starts", 400);
      return res.status(400).json({ error: `Ticket "${ticket_name}" cannot start before the event starts.` });
    }

    if (ticketEnd > eventEnd) {
      logRequest("WARN", "Ticket ends after event ends", 400);
      return res.status(400).json({ error: `Ticket "${ticket_name}" cannot end after the event ends.` });
    }

    if (ticketStart >= ticketEnd) {
      logRequest("WARN", "Ticket start date is after end date", 400);
      return res.status(400).json({ error: `Ticket "${ticket_name}" start date must be before its end date.` });
    }


    const ticket = await createTicketRepository({
      event_id,
      ticket_name,
      ticket_price,
      ticket_quantity,
      ticket_for,
      start_date,
      end_date,
      scope,
      institutions
    });

    logRequest("INFO", "Ticket created successfully", 201);
    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });

  } catch (error) {
    logRequest("ERR", error.message, 500);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};



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



export const updateTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  const logRequest = (level, message, status) => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    logs(duration, level, req.ip, req.method, message, req.path, status, req.headers["user-agent"]);
  };

  try {
    const ticketId = req.params.id;
    const { 
      ticket_name, 
      ticket_price, 
      ticket_quantity, 
      ticket_for, 
      start_date, 
      end_date, 
      scope 
    } = req.body;

    if (!ticketId) {
      logRequest("WARN", "Ticket ID is required", 400);
      return res.status(400).json({ error: "Ticket ID is required." });
    }


    const updateFields = { ticket_name, ticket_price, ticket_quantity, ticket_for, start_date, end_date, scope };
    const hasUpdates = Object.values(updateFields).some(field => field !== undefined);

    if (!hasUpdates) {
      logRequest("WARN", "No update fields provided", 422);
      return res.status(422).json({ error: "At least one field must be provided for update." });
    }

    const currentTicket = await getTicketByIdRepository(ticketId);
    if (!currentTicket) {
      logRequest("WARN", `Ticket not found with ID: ${ticketId}`, 404);
      return res.status(404).json({ error: "Ticket not found." });
    }


    if (start_date || end_date) {

      const event = await getEventByIdRepository(currentTicket.event_id);
      
      if (!event) {
        logRequest("WARN", `Associated event not found for ID: ${currentTicket.event_id}`, 404);
        return res.status(404).json({ error: "The associated event does not exist." });
      }

      const ticketStart = new Date(start_date || currentTicket.start_date);
      const ticketEnd = new Date(end_date || currentTicket.end_date);
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const activeTicketName = ticket_name || currentTicket.ticket_name;

      if (ticketStart < eventStart) {
        logRequest("WARN", "Ticket starts before event starts", 400);
        return res.status(400).json({ error: `Ticket "${activeTicketName}" cannot start before the event starts.` });
      }

      if (ticketEnd > eventEnd) {
        logRequest("WARN", "Ticket ends after event ends", 400);
        return res.status(400).json({ error: `Ticket "${activeTicketName}" cannot end after the event ends.` });
      }

      if (ticketStart >= ticketEnd) {
        logRequest("WARN", "Ticket start date is after end date", 400);
        return res.status(400).json({ error: `Ticket "${activeTicketName}" start date must be before its end date.` });
      }
    }

    const cleanedPayload = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    const updatedTicket = await updateTicketRepository(ticketId, cleanedPayload);

    logRequest("INFO", "Ticket updated successfully", 200);
    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });

  } catch (error) {
    logRequest("ERR", error.message, 500);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};


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


export const getTicketByEventIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;
        const user_id = req.user.sub;
    const {institutionIds} = await getAllUserInstitutionRepository(user_id);
    if (!eventId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "Event ID is required", req.path, 400, req.headers["user-agent"]);

      return res.status(400).json({ error: "Event ID is required" });
    }

    const tickets = await getTicketbyEventIdRepository(eventId ,institutionIds , user_id);

    if (!tickets || tickets.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method,
        "No tickets found for event", req.path, 404, req.headers["user-agent"]);

      return res.status(200).json([]);
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