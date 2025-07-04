import { insert , selectAll , selectById , updateFull , updatePartial , remove } from "../Model/ticket-Model.js";

export const createTicket = async (req, res) => {
  try {
    const ticket = await insert(req.body);
    res.status(201).json({
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Error creating ticket" });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await selectAll();
    res.status(200).json({
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Error fetching tickets" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await selectById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Error fetching ticket" });
  }
};

export const updateTicketFull = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTicket = await updateFull(id, req.body);
    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket (full):", error);
    res.status(500).json({ error: "Error updating ticket" });
  }
};

export const updateTicketPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTicket = await updatePartial(id, req.body);
    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket (partial):", error);
    res.status(500).json({ error: "Error updating ticket" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await remove(id);
    if (!deleted) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Error deleting ticket" });
  }
};
