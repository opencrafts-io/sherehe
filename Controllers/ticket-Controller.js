import { insert , selectAllByAttendeeId , selectByEventId , updateFull , updatePartial , remove } from "../Model/ticket-Model.js";

export const createTicket = async (req, res) => {
  try {
    const result = await insert(req.body);
    if(result === "Ticket created successfully"){
      res.status(201).json({ message: "Ticket created successfully" });
    }else if(result === "Error creating ticket"){
      res.status(403).json({ error: "Error creating ticket" });
    }else if(result === "Wrong Event ID"){
      res.status(403).json({ error: "Wrong Event ID" });
    }else if(result === "Wrong Attendee ID"){
      res.status(403).json({ error: "Wrong Attendee ID" });
    }
    else{
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Error creating ticket" });
  }
};

export const getAllTicketsByAttendeeId = async (req, res) => {
  try {
    const result = await selectAllByAttendeeId(req.params);
    console.log(result)
    if(result === "No tickets found"){
      res.status(404).json({ message: "No tickets found" });
    }else if(result === "Internal server error"){
      res.status(500).json({ error: "Internal server error" });
    }else{
      res.status(200).json({
       result,
      });
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Error fetching tickets" });
  }
};

export const getTicketByEventId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await selectByEventId(req.params);
    if(result === "Ticket not found"){
      res.status(404).json({ message: "Ticket not found" });
    }else if(result === "Internal server error"){
      res.status(500).json({ error: "Internal server error" });
    }else{
      res.status(200).json({
       result,
      });
    }
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Error fetching ticket" });
  }
};

export const updateTicketFull = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateFull(id, req.body);
    if(result === "Ticket not found"){
      res.status(404).json({ message: "Ticket not found" });
    }else if(result === "Internal server error"){
      res.status(500).json({ error: "Internal server error" });
    }else{
      res.status(200).json({
       result,
      });
    }
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
      message: "Ticket partially updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Controller error updating ticket:", error);
    res.status(500).json({ message: "Error updating ticket" });
  }
};


export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await remove(req.params);
    if(result === "Ticket not found"){
      res.status(404).json({ message: "Ticket not found" });
    }else if(result === "Internal server error"){
      res.status(500).json({ error: "Internal server error" });
    }else{
      res.status(200).json({
       result,
      });
    }
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Error deleting ticket" });
  }
};
