import { insert , selectAllByAttendeeId , selectByEventId , updateFull , updatePartial , remove } from "../Model/ticket-Model.js";
import { logs } from "../utils/logs.js";


export const createTicket = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const result = await insert(req.body);
    if(result === "Ticket created successfully"){
      msg = "Ticket created successfully";
      level = "INF";
      res.status(201).json({ message: msg });
    }else if(result === "Error creating ticket"){
      msg = "Error creating ticket";
      level = "ERR";
      res.status(404).json({ error: "Missing required fields" });
    }else if(result === "Wrong Event ID"){
      msg = "Wrong Event ID provided for ticket creation";
      level = "ERR";
      res.status(404).json({ error: "Wrong Event ID" });
    }else if(result === "Wrong Attendee ID"){
      msg = "Wrong Attendee ID provided for ticket creation";
      level = "ERR";
      res.status(404).json({ error: "Wrong Attendee ID" });
    }
  } catch (error) {
    msg = `Controller error creating ticket: ${error.message}`;
    level = "ERR";
    res.status(500).json({ error: "Error creating ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const getAllTicketsByAttendeeId = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { limit, page } = req.pagination;
    const result = await selectAllByAttendeeId({ ...req.params, ...req.pagination });

    if(result === "No tickets found"){
      msg = "No tickets found for attendee ID";
      level = "INF";
      return res.status(200).json([]);
    }

    const hasNextPage = result.length > limit;
    const tickets = hasNextPage ? result.slice(0, limit) : result;

    msg = "Tickets fetched successfully by attendee ID";
    level = "INF";
    res.status(200).json({
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      data: tickets,
    });
  } catch (error) {
    msg = `Controller error fetching tickets by attendee ID: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error fetching tickets" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const getTicketByEventId = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { limit, page } = req.pagination;

    const result = await selectByEventId({ ...req.params, ...req.pagination });

    if(result === "Ticket not found"){
      msg = "Ticket not found by Event ID";
      level = "INF";
      res.status(200).json([]);
    } else {
      const hasNextPage = result.length > limit;
      const tickets = hasNextPage ? result.slice(0, limit) : result;

      msg = "Tickets fetched successfully by event ID";
      level = "INF";
      res.status(200).json({
        currentPage: page,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        data: tickets
      });
    }
  } catch (error) {
    msg = `Controller error fetching ticket by event ID: ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error fetching tickets" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const updateTicketFull = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const result = await updateFull(id, req.body);
    if(result === "Ticket not found"){
      msg = "Ticket not found for full update";
      level = "INF";
      res.status(404).json({ message: msg });
    }else{
      msg = "Ticket updated successfully (full)";
      level = "INF";
      res.status(200).json({
       result,
      });
    }
  } catch (error) {
    msg = `Controller error updating ticket (full): ${error.message}`;
    level = "ERR";
    res.status(500).json({ error: "Error updating ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};

export const updateTicketPartial = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const updatedTicket = await updatePartial(id, req.body);
    

    if (updatedTicket === "No fields provided or invalid update data.") {
      msg = "Ticket not found for partial update";
      level = "INF";
      return res.status(404).json({ message: msg });
    }

    msg = "Ticket partially updated successfully";
    level = "INF";
    res.status(200).json({
      message: msg,
      data: updatedTicket,
    });
  } catch (error) {
    msg = `Controller error updating ticket (partial): ${error.message}`;
    level = "ERR";
    res.status(500).json({ message: "Error updating ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};


export const deleteTicket = async (req, res) => {
  const startTime = process.hrtime.bigint();
  let level;
  let msg;

  try {
    const { id } = req.params;
    const result = await remove(req.params);
    if(result === "Ticket not found"){
      msg = "Ticket not found for deletion";
      level = "INF";
      res.status(404).json({ message: msg });
    }else{
      msg = "Ticket deleted successfully";
      level = "INF";
      res.status(200).json({
       result,
      });
    }
  } catch (error) {
    msg = `Controller error deleting ticket: ${error.message}`;
    level = "ERR";
    res.status(500).json({ error: "Error deleting ticket" });
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMicroseconds = Number(endTime - startTime) / 1000;
    await logs(durationMicroseconds, level, req.ip, req.method, msg, req.url, res.statusCode, req.headers["user-agent"]);
  }
};