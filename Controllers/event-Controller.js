import { insert, selectAll, selectById, update, remove , search } from "../Model/event-Model.js";
import dotenv from "dotenv";
import { logs } from "../utils/logs.js";
import sharp from "sharp";

dotenv.config();


export const createEvent = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { name, description, url, time, date, location, organizer, organizer_id, genre } = req.body;

    if (!req.files || !req.files.event_card_image || !req.files.poster || !req.files.banner) {
      msg = "Event card image, poster, and banner are required";
      level = "ERR";
      return res.status(400).json({ message: msg });
    }

    // Paths
    const event_card_path = req.files.event_card_image[0].path;
    const banner_path = req.files.banner[0].path;
    const poster_path = req.files.poster[0].path;

    // ✅ Resize / enforce aspect ratios
    const eventCardResized = `${event_card_path}-resized.jpg`;
    await sharp(event_card_path)
      .resize(1000, 1000, { fit: "cover" }) // 1:1
      .toFile(eventCardResized);

    const bannerResized = `${banner_path}-resized.jpg`;
    await sharp(banner_path)
      .resize(1600, 900, { fit: "cover" }) // 16:9
      .toFile(bannerResized);

    const posterResized = `${poster_path}-resized.jpg`;
    await sharp(poster_path)
      .resize(1000, 1500, { fit: "cover" }) // example 2:3 ratio for posters
      .toFile(posterResized);

    // URLs
    const event_card_image = `${process.env.BASE_URL}/${eventCardResized.split("/").pop()}`;
    const poster = `${process.env.BASE_URL}/${posterResized.split("/").pop()}`;
    const banner = `${process.env.BASE_URL}/${bannerResized.split("/").pop()}`;

    // DB insert
    const result = await insert(
      name, description, url, time,
      event_card_image, poster, banner,
      date, location, organizer, organizer_id, genre
    );

    if (result === "Error creating event") {
      msg = "Error creating event from model";
      level = "ERR";
      return res.status(500).json({ message: "Error creating event" });
    } else {
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
};


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
     return res.status(200).json([]);
    }

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    msg = "Events fetched successfully";
    level = "INF";
   return res.status(200).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: events
    });
  } catch (error) {
    msg = `Controller error fetching all events: ${error.message}`;
    level = "ERR";
  return  res.status(500).json({ message: "Error fetching events" });
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
     return res.status(404).json({ message: "Error fetching event" });
    } else {
      msg = "Event fetched successfully by ID";
      level = "INF";
    return  res.status(200).json({ result });
    }
  } catch (error) {
    msg = `Controller error fetching event by ID: ${error.message}`;
    level = "ERR";
  return res.status(500).json({ message: "Error fetching event" });
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
    return  res.status(404).json({ message: "Event not found for update" });
    } else {
      msg = "Event updated successfully";
      level = "INF";
     return res.status(200).json({ message: msg });
    }
  } catch (error) {
    msg = `Controller error updating event: ${error.message}`;
    level = "ERR";
  return  res.status(500).json({ message: "Error updating event" });
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
    return  res.status(404).json({ message: "Event not found for deletion" });
    } else {
      msg = "Event deleted successfully";
      level = "INF";
     return res.status(200).json({ message: msg });
    }
  } catch (error) {
    msg = `Controller error deleting event: ${error.message}`;
    level = "ERR";
   return res.status(500).json({ message: "Error deleting event" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
}

export const searchEvents = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { searchQuery } = req.query;

    const result = await search({ searchQuery }); // ✅ fixed

    if (result.length === 0) {
      msg = "No events found";
      level = "ERR";
      return res.status(200).json([]); // empty array
    } else {
      msg = "Events found successfully";
      level = "INF";
      return res.status(200).json(result);
    }
  } catch (error) {
    msg = `Controller error searching events: ${error.message}`;
    level = "ERR";
    return res.status(500).json({ message: "Error searching events" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(
      durationMicroseconds,
      level,
      req.ip,
      req.method,
      msg,
      req.url,
      res.statusCode,
      req.headers["user-agent"]
    );
  }
};

