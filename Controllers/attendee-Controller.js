import { insert, selectAll, selectById, updateFull, updatePartial , remove } from "../Model/attendee-Model.js";


//controllers
export const createAttendee = async (req, res) => {
  try {
    const result = await insert(req.body);
    if (result === "Error creating attendee") {
      res.status(500).json({ error: "Error creating attendee" });
    } else if (result === "Attendee created successfully") {
      res.status(201).json({ message: "Attendee created successfully" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error creating attendee:", error);
    res.status(500).json({ error: "Error creating attendee" });
  }
};

export const getAllAttendeesByEventId = async (req, res) => {
  try {
    const { limit, page } = req.pagination;

    const result = await selectAll({ ...req.params, ...req.pagination });


    if(result === "No attendees found"){
      return res.status(404).json({ message: "No attendees found" });
    }

    const hasNextPage = result.length > limit;
    const attendees = hasNextPage ? result.slice(0, limit) : result;

    res.status(200).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: attendees
    });
    
  } catch (error) {
    console.error("Controller error fetching attendees:", error);
    res.status(500).json({ message: "Error fetching attendees" });
  }
};

export const getAttendeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await selectById(req.params);


    if(result === "Attendee not found"){
      res.status(404).json({ message: "Attendee not found" });
    }else if(result === "Internal server error"){
      res.status(500).json({ error: "Internal server error" });
    }else{
      res.status(200).json({
       result,
      });
    }
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
    const result = await remove(req.params);

    if(result === "Attendee not found"){
      res.status(404).json({ message: "Attendee not found" });
    }else if(result === "Internal server error"){
      res.status(500).json({ error: "Internal server error" });
    }else{
      res.status(200).json({
       result,
      });
    }
  } catch (error) {
    console.error("Error in controller while deleting attendee:", error);
    res.status(500).json({ message: "Error deleting attendee" });
  }
};
