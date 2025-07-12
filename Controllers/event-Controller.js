import { insert , selectAll , selectById , update , remove } from "../Model/event-Model.js";

export const createEvent = async (req, res) => {
  try {
    const result = await insert(req.body);
    if(result === "Error creating event"){
      res.status(500).json({ message: "Error creating event" });
    }else{
      res.status(200).json({ message: "Event created successfully" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating event" });
  }
}

export const getAllEvents = async (req, res) => {
  try {
    const { limit, page } = req.pagination;

    const result = await selectAll(req.pagination);

    if (result === "No events found") {
      return res.status(404).json({ message: "No events found" });
    }

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    res.status(200).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: events
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching events" });
  }
}

export const getEventById = async (req, res) => {
  try {
    const result = await selectById(req.params);
    if(result === "Error fetching event"){
      res.status(500).json({ message: "Error fetching event" });
    }else{
      res.status(200).json({ result });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching event" });
  }
}

export const updateEvent = async (req, res) => {
  try {
    const result = await update(req.body);
    if(result === "Error updating event"){
      res.status(500).json({ message: "Error updating event" });
    }else{
      res.status(200).json({ message: "Event updated successfully" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error updating event" });
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const result = await remove(req.params);
    if(result === "Error deleting event"){
      res.status(500).json({ message: "Error deleting event" });
    }else{
      res.status(200).json({ message: "Event deleted successfully" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error deleting event" });
  }
}