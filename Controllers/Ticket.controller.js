import {createTicketRepository , getAllTicketsRepository , getTicketByIdRepository , updateTicketRepository , deleteTicketRepository , getTicketbyEventIdRepository} from '../Repositories/Ticket.repository.js';

export const createTicketController = async (req, res) => {
  try {
    const { event_id, ticket_name, ticket_price, ticket_quantity } = req.body;

    // 🧩 Validate input
    if (!event_id || !ticket_price || !ticket_quantity) {
      return res.status(400).json({
        error: "Missing required fields: event_id, ticket_price, and ticket_quantity are required.",
      });
    }

    // 💾 Create ticket
    const ticket = await createTicketRepository({
      event_id,
      ticket_name,
      ticket_price,
      ticket_quantity,
    });

    // ✅ 201 Created
    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    // 🛑 500 Internal Server Error
    res.status(500).json({ error: error.message });
  }
};


export const getAllTicketsController = async (req, res) => {
  try {
    const tickets = await getAllTicketsRepository();

    // 🟡 No tickets found
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        message: [],
      });
    }

    // ✅ Tickets retrieved successfully
    res.status(200).json({
      message: "Tickets retrieved successfully",
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    // 🛑 Server error
    res.status(500).json({ error: error.message });
  }
};

export const getTicketByIdController = async (req, res) => {
  try {
    const ticketId = req.params.id;

    // 🟡 Validate input
    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    // 🔍 Fetch the ticket
    const ticket = await getTicketByIdRepository(ticketId);

    // 🟥 Ticket not found
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // ✅ Ticket found
    res.status(200).json({
      message: "Ticket retrieved successfully",
      ticket,
    });
  } catch (error) {
    // 🛑 Server error
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};


export const updateTicketController = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { ticket_name, ticket_price, ticket_quantity } = req.body;

    // 🟡 Validate required fields
    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    if (
      ticket_name === undefined &&
      ticket_price === undefined &&
      ticket_quantity === undefined
    ) {
      return res.status(422).json({ error: "At least one field must be provided for update" });
    }

    // 🔄 Attempt to update
    const ticket = await updateTicketRepository(ticketId, {
      ticket_name,
      ticket_price,
      ticket_quantity,
    });

    // 🟥 Ticket not found
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // ✅ Success
    res.status(200).json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    // 🛑 Server error
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};


export const deleteTicketController = async (req, res) => {
  try {
    const ticketId = req.params.id;

    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    const deleted = await deleteTicketRepository(ticketId);

    if (!deleted) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(204).send(); // success, no content
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete ticket",
      details: error.message,
    });
  }
};


export const getTicketByEventIdController = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const tickets = await getTicketByEventIdRepository(eventId);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found for this event" });
    }

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch tickets",
      details: error.message,
    });
  }
};
