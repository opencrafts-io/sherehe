import { insert , selectAllByAttendeeId , selectByEventId , updateFull , updatePartial , remove } from "../Model/ticket-Model.js";

const getTimestamp = () => new Date().toISOString();

export const createTicket = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'POST';
  const path = req.originalUrl || req.url || '/v2/tickets';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const result = await insert(req.body);
    if(result === "Ticket created successfully"){
      status = 201;
      msg = "Ticket created successfully";
      level = "INF";
      res.status(status).json({ message: msg });
    }else if(result === "Error creating ticket"){
      status = 403;
      msg = "Error creating ticket from model due to business logic";
      level = "ERR";
      res.status(status).json({ error: "Error creating ticket" });
    }else if(result === "Wrong Event ID"){
      status = 403;
      msg = "Wrong Event ID provided for ticket creation";
      level = "ERR";
      res.status(status).json({ error: "Wrong Event ID" });
    }else if(result === "Wrong Attendee ID"){
      status = 403;
      msg = "Wrong Attendee ID provided for ticket creation";
      level = "ERR";
      res.status(status).json({ error: "Wrong Attendee ID" });
    }
    else{
      status = 500;
      msg = "Unexpected internal server error from model during ticket creation";
      level = "ERR";
      res.status(status).json({ error: "Internal server error" });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error creating ticket: ${error.message}`;
    level = "ERR";
    res.status(status).json({ error: "Error creating ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const getAllTicketsByAttendeeId = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'GET';
  const path = req.originalUrl || req.url || `/v2/attendees/${req.params.attendeeId}/tickets`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { limit, page } = req.pagination;
    const result = await selectAllByAttendeeId({ ...req.params, ...req.pagination });

    if(result === "No tickets found"){
      status = 404;
      msg = "No tickets found for attendee ID";
      level = "INF";
      return res.status(status).json({ message: msg });
    }

    const hasNextPage = result.length > limit;
    const tickets = hasNextPage ? result.slice(0, limit) : result;

    status = 200;
    msg = "Tickets fetched successfully by attendee ID";
    level = "INF";
    res.status(status).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: tickets,
    });
  } catch (error) {
    status = 500;
    msg = `Controller error fetching tickets by attendee ID: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error fetching tickets" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const getTicketByEventId = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'GET';
  const path = req.originalUrl || req.url || `/v2/events/${req.params.eventId}/tickets`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { limit, page } = req.pagination;
    const { id } = req.params;

    const result = await selectByEventId({ ...req.params, ...req.pagination });

    if(result === "Ticket not found"){
      status = 404;
      msg = "Ticket not found by Event ID";
      level = "INF";
      res.status(status).json({ message: msg });
    } else {
      const hasNextPage = result.length > limit;
      const tickets = hasNextPage ? result.slice(0, limit) : result;

      status = 200;
      msg = "Tickets fetched successfully by event ID";
      level = "INF";
      res.status(status).json({
        currentPage: page,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        data: tickets
      });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error fetching ticket by event ID: ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error fetching tickets" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const updateTicketFull = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'PUT';
  const path = req.originalUrl || req.url || `/v2/tickets/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { id } = req.params;
    const result = await updateFull(id, req.body);
    if(result === "Ticket not found"){
      status = 404;
      msg = "Ticket not found for full update";
      level = "INF";
      res.status(status).json({ message: msg });
    }else if(result === "Internal server error"){
      status = 500;
      msg = "Internal server error from model for full ticket update";
      level = "ERR";
      res.status(status).json({ error: "Internal server error" });
    }else{
      status = 200;
      msg = "Ticket updated successfully (full)";
      level = "INF";
      res.status(status).json({
       result,
      });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error updating ticket (full): ${error.message}`;
    level = "ERR";
    res.status(status).json({ error: "Error updating ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};

export const updateTicketPartial = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'PATCH';
  const path = req.originalUrl || req.url || `/v2/tickets/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { id } = req.params;
    const updatedTicket = await updatePartial(id, req.body);

    if (!updatedTicket) {
      status = 404;
      msg = "Ticket not found for partial update";
      level = "INF";
      return res.status(status).json({ message: msg });
    }

    status = 200;
    msg = "Ticket partially updated successfully";
    level = "INF";
    res.status(status).json({
      message: msg,
      data: updatedTicket,
    });
  } catch (error) {
    status = 500;
    msg = `Controller error updating ticket (partial): ${error.message}`;
    level = "ERR";
    res.status(status).json({ message: "Error updating ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};


export const deleteTicket = async (req, res) => {
  const clientIp = req.ip || 'unknown';
  const method = 'DELETE';
  const path = req.originalUrl || req.url || `/v2/tickets/${req.params.id}`;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const startTime = process.hrtime.bigint();

  let status;
  let msg;
  let level;
  let durationMicroseconds;

  try {
    const { id } = req.params;
    const result = await remove(req.params);
    if(result === "Ticket not found"){
      status = 404;
      msg = "Ticket not found for deletion";
      level = "INF";
      res.status(status).json({ message: msg });
    }else if(result === "Internal server error"){
      status = 500;
      msg = "Internal server error from model for ticket deletion";
      level = "ERR";
      res.status(status).json({ error: "Internal server error" });
    }else{
      status = 200;
      msg = "Ticket deleted successfully";
      level = "INF";
      res.status(status).json({
       result,
      });
    }
  } catch (error) {
    status = 500;
    msg = `Controller error deleting ticket: ${error.message}`;
    level = "ERR";
    res.status(status).json({ error: "Error deleting ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    durationMicroseconds = Number(endTime - startTime) / 1000;
    console.log(`${getTimestamp()} ${level} | client_ip=${clientIp} duration=${durationMicroseconds}μs method=${method} msg=${msg} path=${path} status=${status} user_agent=${userAgent}`);
  }
};