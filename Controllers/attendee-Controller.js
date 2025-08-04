import { insert, selectAll, selectById, updateFull, updatePartial, remove } from "../Model/attendee-Model.js";
import { logs } from "../utils/logs.js";


export const createAttendee = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;
  try {
    const result = await insert(req.body);

    if (result === "Error creating attendee") {
      msg = "Error creating attendee from model";
      level = "ERR";
      res.status(500).json({ error: "Error creating attendee" });
    } else if (result === "Attendee created successfully") {
      msg = "Attendee created successfully";
      level = "INF";
      res.status(201).json({ message: msg });
    } else {
      msg = "Unexpected response from model during attendee creation";
      level = "ERR";
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    msg = `Controller error creating attendee: ${error.message}`;
    level = "ERR";
    res.status(500).json({ error: "Error creating attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const getAllAttendeesByEventId = async (req, res) => {
    const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { limit, page } = req.pagination;
    const result = await selectAll({ ...req.params, ...req.pagination });

    if (result === "No attendees found") {
      msg = "No attendees found for event";
      level = "INF";
      return res.status(404).json({ message: msg });
    }

    const hasNextPage = result.length > limit;
    const attendees = hasNextPage ? result.slice(0, limit) : result;

    msg = "Attendees fetched successfully";
    level = "INF";
    res.status(200).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: attendees
    });
  } catch (error) {
    msg = `Controller error fetching attendees by event ID: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error fetching attendees" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const getAttendeeById = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const result = await selectById(req.params);

    if (result === "Attendee not found") {
      msg = "Attendee not found by ID";
      level = "INF";
      res.status(404).json({ message: msg });
    } else if (result === "Internal server error") {
      msg = "Internal server error from model for get attendee by ID";
      level = "ERR";
      res.status(500).json({ error: "Internal server error" });
    } else {
      msg = "Attendee fetched successfully by ID";
      level = "INF";
      res.status(200).json({
        result,
      });
    }
  } catch (error) {
    msg = `Controller error fetching attendee by ID: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error fetching attendee" });
  } finally {
        const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const updateAttendee = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const attendee = await updateFull(id, req.body);

    if (!attendee) {
      msg = "Attendee not found for full update";
      level = "INF";
      return res.status(404).json({ message: msg });
    }

    msg = "Attendee updated successfully";
    level = "INF";
    res.status(200).json({
      message: msg,
      data: attendee,
    });
  } catch (error) {
    msg = `Controller error updating attendee: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error updating attendee" });
  } finally {
        const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const patchAttendee = async (req, res) => {
    const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const updatedAttendee = await updatePartial(id, req.body);

    if (!updatedAttendee) {
      msg = "Attendee not found for partial update";
      level = "INF";
      return res.status(404).json({ message: msg });
    }

    msg = "Attendee partially updated successfully";
    level = "INF";
    res.status(200).json({
      message: msg,
      data: updatedAttendee,
    });
  } catch (error) {
    msg = `Controller error patching attendee: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error updating attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const deleteAttendee = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const result = await remove(req.params);

    if (result === "Attendee not found") {
      msg = "Attendee not found for deletion";
      level = "INF";
      res.status(404).json({ message: msg });
    } else if (result === "Internal server error") {
      msg = "Internal server error from model for attendee deletion";
      level = "ERR";
      res.status(500).json({ error: "Internal server error" });
    } else {
      msg = "Attendee deleted successfully";
      level = "INF";
      res.status(200).json({
        result,
      });
    }
  } catch (error) {
    msg = `Controller error deleting attendee: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error deleting attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};