import { insert, selectAll, selectById, update, remove } from '../Model/ticket-Model.js'

export const createTicket = async (req, res) => {
    try {
        const result = await insert(req.body);
        if (result === "Error creating ticket") {
            res.status(500).json({message: "Error creating ticket"});
        } else {
            res.status(200).json({message: "Ticket created successfully"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error creating ticket"});
    }
};

export const getAllTickets = async (req, res) => {
    try {
        const result = await selectAll();
        if (result === "Error fetching tickets") {
            res.status(500).json({message: "Error fetching tickets"});
        } else {
            res.status(200).json({
                message: "Tickets fetched successfully",
                data: result
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error fetching tickets"})
    }
};

export const getTicketById = async (req, res) => {
  try {
    const result = await selectById(req.params);
    if(result === "Error fetching ticket"){
      res.status(500).json({ message: "Error fetching ticket" });
    }else{
      res.status(200).json({ message: "Ticket fetched successfully", data: result });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching ticket" });
  }
}

export const updateTicket = async (req, res) => {
  try {
    const result = await update(req.body);
    if(result === "Error updating ticket"){
      res.status(500).json({ message: "Error updating ticket" });
    }else{
      res.status(200).json({ message: "Ticket updated successfully" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error updating ticket" });
  }
}

export const deleteTicket = async (req, res) => {
  try {
    const result = await remove(req.params);
    if(result === "Error deleting ticket"){
      res.status(500).json({ message: "Error deleting ticket" });
    }else{
      res.status(200).json({ message: "Ticket deleted successfully" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error deleting ticket" });
  }
}