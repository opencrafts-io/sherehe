import { insert, selectAll, selectById, updateFull, updatePartial , remove } from "../Model/attendee-Model.js";

const getTimestamp = () => new Date().toISOString();

export const createAttendee = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'POST';
  const path = req.originalUrl || req.url || '/v2/attendees';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const result = await insert(req.body);

    if (result === "Error creating attendee") {
      status = 500;
      msg = "Error creating attendee from model";
      level = "ERR";
      res.status(status).json({ error: "Error creating attendee" });
    } else if (result === "Attendee created successfully") {
      status = 201;
      msg = "Attendee created successfully";
      level = "INF";
      res.status(status).json({ message: msg });
    } else {
      status = 500;
      msg = "Unexpected response from model during attendee creation";
      level = "ERR";
      res.status(status).json({ error: "Internal server error" });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error creating attendee: ${error.message}`;
    level = "ERR";
    res.status(status).json({ error: "Error creating attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const getAllAttendeesByEventId = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'GET';
  const path = req.originalUrl || req.url || `/v2/events/${req.params.eventId}/attendees`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { limit, page } = req.pagination;
    const result = await selectAll({ ...req.params, ...req.pagination });

    if(result === "No attendees found"){
      status = 404;
      msg = "No attendees found for event";
      level = "INF";
      return res.status(status).json({ message: msg });
    }

    const hasNextPage = result.length > limit;
    const attendees = hasNextPage ? result.slice(0, limit) : result;

    status = 200;
    msg = "Attendees fetched successfully";
    level = "INF";
    res.status(status).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: attendees
    });
  } catch (error) {
    status = 500;
    msg = `Controller error fetching attendees by event ID: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error fetching attendees" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const getAttendeeById = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'GET';
  const path = req.originalUrl || req.url || `/v2/attendees/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { id } = req.params;
    const result = await selectById(req.params);

    if(result === "Attendee not found"){
      status = 404;
      msg = "Attendee not found by ID";
      level = "INF";
      res.status(status).json({ message: msg });
    }else if(result === "Internal server error"){
      status = 500;
      msg = "Internal server error from model for get attendee by ID";
      level = "ERR";
      res.status(status).json({ error: "Internal server error" });
    }else{
      status = 200;
      msg = "Attendee fetched successfully by ID";
      level = "INF";
      res.status(status).json({
       result,
      });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error fetching attendee by ID: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error fetching attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const updateAttendee = async (req, res) => {
    const clientIp = req.ip || 'unknown';
    const method = 'PUT';
    const path = req.originalUrl || req.url || `/v2/attendees/${req.params.id}`;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const startTime = process.hrtime.bigint();

    let status;
    let msg;
    let level;
    let durationMicroseconds;

    try {
        const { id } = req.params;
        const attendee = await updateFull(id, req.body);

        if (!attendee) {
            status = 404;
            msg = "Attendee not found for full update";
            level = "INF";
            return res.status(status).json({ message: msg });
        }

        status = 200;
        msg = "Attendee updated successfully";
        level = "INF";
        res.status(status).json({
            message: msg,
            data: attendee,
        });
    } catch (error) {
        status = 500;
        msg = `Controller error updating attendee: ${error.message}`;
        level = "ERR";
        res.status(status).json({ message: "Error updating attendee" });
    } finally {
        const endTime = process.hrtime.bigint();
        durationMicroseconds = Number(endTime - startTime) / 1000;
        console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
    }
};

export const patchAttendee = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'PATCH';
  const path = req.originalUrl || req.url || `/v2/attendees/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { id } = req.params;
    const updatedAttendee = await updatePartial(id, req.body);

    if (!updatedAttendee) {
      status = 404;
      msg = "Attendee not found for partial update";
      level = "INF";
      return res.status(status).json({ message: msg });
    }

    status = 200;
    msg = "Attendee partially updated successfully";
    level = "INF";
    res.status(status).json({
        message: msg,
        data: updatedAttendee,
    });
  } catch (error) {
    status = 500;
    msg = `Controller error patching attendee: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error updating attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const deleteAttendee = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'DELETE';
  const path = req.originalUrl || req.url || `/v2/attendees/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { id } = req.params;
    const result = await remove(req.params);

    if(result === "Attendee not found"){
      status = 404;
      msg = "Attendee not found for deletion";
      level = "INF";
      res.status(status).json({ message: msg });
    }else if(result === "Internal server error"){
      status = 500;
      msg = "Internal server error from model for attendee deletion";
      level = "ERR";
      res.status(status).json({ error: "Internal server error" });
    }else{
      status = 200;
      msg = "Attendee deleted successfully";
      level = "INF";
      res.status(status).json({
       result,
      });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error deleting attendee: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error deleting attendee" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};