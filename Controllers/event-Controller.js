import { insert , selectAll , selectById , update , remove } from "../Model/event-Model.js";

const getTimestamp = () => new Date().toISOString();

export const createEvent = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'POST';
  const path = req.originalUrl || req.url || '/v2/events';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const result = await insert(req.body);
    if(result === "Error creating event"){
      status = 500;
      msg = "Error creating event from model";
      level = "ERR";
      res.status(status).json({ message: "Error creating event" });
    }else{
      status = 200;
      msg = "Event created successfully";
      level = "INF";
      res.status(status).json({ message: msg });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error creating event: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error creating event" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
}

export const getAllEvents = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'GET';
  const path = req.originalUrl || req.url || '/v2/events';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { limit, page } = req.pagination;

    const result = await selectAll(req.pagination);

    if (result === "No events found") {
      status = 404;
      msg = "No events found";
      level = "INF";
      return res.status(status).json({ message: msg });
    }

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    status = 200;
    msg = "Events fetched successfully";
    level = "INF";
    res.status(status).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: events
    });
  } catch (error) {
    status = 500;
    msg = `Controller error fetching all events: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error fetching events" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
}

export const getEventById = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'GET';
  const path = req.originalUrl || req.url || `/v2/events/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const result = await selectById(req.params);
    if(result === "Error fetching event"){
      status = 500;
      msg = "Error fetching event from model";
      level = "ERR";
      res.status(status).json({ message: "Error fetching event" });
    }else{
      status = 200;
      msg = "Event fetched successfully by ID";
      level = "INF";
      res.status(status).json({ result });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error fetching event by ID: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error fetching event" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
}

export const updateEvent = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'PUT';
  const path = req.originalUrl || req.url || `/v2/events/${req.body.id || 'unknown_id'}`; // Assuming ID is in body for update
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const result = await update(req.body);
    if(result === "Error updating event"){
      status = 500;
      msg = "Error updating event from model";
      level = "ERR";
      res.status(status).json({ message: "Error updating event" });
    }else{
      status = 200;
      msg = "Event updated successfully";
      level = "INF";
      res.status(status).json({ message: msg });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error updating event: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error updating event" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
}

export const deleteEvent = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'DELETE';
  const path = req.originalUrl || req.url || `/v2/events/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const result = await remove(req.params);
    if(result === "Error deleting event"){
      status = 500;
      msg = "Error deleting event from model";
      level = "ERR";
      res.status(status).json({ message: "Error deleting event" });
    }else{
      status = 200;
      msg = "Event deleted successfully";
      level = "INF";
      res.status(status).json({ message: msg });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error deleting event: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error deleting event" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
}