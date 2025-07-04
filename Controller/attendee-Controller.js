import { insert, selectAll, selectById, updateFull, updatePartial , remove } from "../Model/attendee-Model.js";

export const createAttendee = async (req, res) => {
  try {
    const attendee = await insert(req.body);
    res.status(201).json({
      message: "Attendee created successfully",
      attendee,
    });
  } catch (error) {
    console.error("Error creating attendee:", error);
    res.status(500).json({ error: "Error creating attendee" });
  }
};

export const getAllAttendees = async (req, res) => {
  try {
    const attendees = await selectAll();
    res.status(200).json({
      message: "Attendees fetched successfully",
      data: attendees,
    });
  } catch (error) {
    console.error("Controller error fetching attendees:", error);
    res.status(500).json({ message: "Error fetching attendees" });
  }
};

export const getAttendeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendee = await selectById(id);

    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    res.status(200).json({
      message: "Attendee fetched successfully",
      data: attendee,
    });
  } catch (error) {
    console.error("Controller Error fetching attendee:", error);
    res.status(500).json({ message: "Error fetching attendee" });
  }
};

export const updateAttendee = async (req, res) => {
    try {
        const { id } = req.params;
        const attendee = await updateFull(id, req.body);

        if (!attendee) {
            return res.status(404).json({ message: "Attendee not found" });
        }

        res.status(200).json({
            message: "Attendee updated successfully",
            data: attendee,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating attendee" });
    }
};


export const patchAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAttendee = await updatePartial(id, req.body);

    if (!updatedAttendee) {
      return res.status(404).json({ message: "Attendee not found" });
    }

    res.status(200).json({
        message: "Attendee partially updated successfully",
        data: updatedAttendee,
    });
  } catch (error) {
    console.error("Controller error updating attendee:", error);
    res.status(500).json({ message: "Error updating attendee" });
  }
};

export const deleteAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await remove(id);

    if (!deleted) {
      return res.status(404).json({ message: "Attendee not found" });
    }

    res.status(200).json({ message: "Attendee deleted successfully" });
  } catch (error) {
    console.error("Error in controller while deleting attendee:", error);
    res.status(500).json({ message: "Error deleting attendee" });
  }
};
