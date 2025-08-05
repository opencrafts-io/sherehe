import { insert, selectAll, selectById, update, remove } from "../Model/event-Model.js";
import dotenv from "dotenv";
import { logs } from "../utils/logs.js";

dotenv.config();


export const createEvent = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { name, description, url, time, date, location, organizer, organizer_id, genre } = req.body;

    if (!req.file) {
      msg = "No image uploaded";
      level = "ERR";
      return res.status(400).json({ message: 'No image uploaded' });
    }


    const image_url = `${process.env.BASE_URL}/${req.file.filename}`;

    const result = await insert(name, description, url, time, image_url, date, location, organizer, organizer_id, genre);
    if (result === "Error creating event") {
      msg = "Error creating event from model";
      level = "ERR";
      return res.status(500).json({ message: "Error creating event" });
    } else if (result === "Event created successfully") {
      msg = "Event created successfully";
      level = "INF";
      return res.status(201).json({ message: msg });
    }
  } catch (error) {
    msg = `Controller error creating event: ${error.message}`;
    level = "ERR";
    return res.status(500).json({ message: "Error creating event" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
}

export const getAllEvents = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { limit, page } = req.pagination;

    const result = await selectAll(req.pagination);

    if (result === "No events found") {
      msg = "No events found";
      level = "INF";
      res.status(200).json([]);
    }

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    msg = "Events fetched successfully";
    level = "INF";
    res.status(200).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: events
    });
  } catch (error) {
    msg = `Controller error fetching all events: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error fetching events" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
}

export const getEventById = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const result = await selectById(req.params);
    if (result === "Event not foundt") {
      msg = "Event not found";
      level = "ERR";
      res.status(404).json({ message: "Error fetching event" });
    } else {
      msg = "Event fetched successfully by ID";
      level = "INF";
      res.status(200).json({ result });
    }
  } catch (error) {
    msg = `Controller error fetching event by ID: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error fetching event" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
}

export const updateEvent = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const result = await update(req.body);
    if (result === "Event not found") {
      msg = "Event not found for update";
      level = "ERR";
      res.status(404).json({ message: "Event not found for update" });
    } else {
      msg = "Event updated successfully";
      level = "INF";
      res.status(200).json({ message: msg });
    }
  } catch (error) {
    msg = `Controller error updating event: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error updating event" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
}

export const deleteEvent = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const result = await remove(req.params);
    if (result === "Event not found") {
      msg = "Event not found for deletion";
      level = "ERR";
      res.status(404).json({ message: "Event not found for deletion" });
    } else {
      msg = "Event deleted successfully";
      level = "INF";
      res.status(200).json({ message: msg });
    }
  } catch (error) {
    msg = `Controller error deleting event: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error deleting event" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
}