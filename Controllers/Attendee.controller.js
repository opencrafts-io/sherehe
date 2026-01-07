import { 
  createAttendeeRepository,
  getAllAttendeesByEventIdRepository,
  deleteAttendeeRepository,
  getAttendeeByIdRepository,
  getAttendeesByUserIdRepository,
  getUserAttendedEventsRepository,
  searchAttendeesByEventNameTicketNameRepository,
  getAllUserAttendedSpecificEventRepository
} from "../Repositories/Attendee.repository.js";

import { logs } from "../Utils/logs.js"; 



export const createAttendeeController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { event_id, user_id } = req.body;

    if (!event_id || !user_id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing event_id or user_id", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const attendee = await createAttendeeRepository({ event_id, user_id });

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendee created", req.path, 201, req.headers["user-agent"]);

    res.status(201).json({
      message: "Attendee successfully registered for the event",
      attendee,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};



export const deleteAttendeeController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const attendeeId = req.params.id;

    if (!attendeeId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing attendee ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Attendee ID is required" });
    }

    const result = await deleteAttendeeRepository(attendeeId);

    if (!result) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Attendee not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Attendee not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendee soft-deleted", req.path, 200, req.headers["user-agent"]);

    res.status(200).json({ message: "Attendee deleted successfully" });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};



export const getAllAttendeesByEventIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;
     const { limit, page, limitPlusOne, offset } = req.pagination;

    if (!eventId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing event ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Event ID is required" });
    }

    const result = await getAllAttendeesByEventIdRepository(eventId , limitPlusOne, offset);

         const hasNextPage = result.length > limit;
    const attendees = hasNextPage ? result.slice(0, limit) : result;


    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendees retrieved", req.path, 200, req.headers["user-agent"]);

      return res.status(200).json({
      status: "success",
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalAttendees: attendees.length,
      data: attendees,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};



export const getAttendeesByIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const id = req.params.id;

    if (!id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing attendee ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Attendee ID is required" });
    }

    const attendee = await getAttendeeByIdRepository(id);

    if (!attendee) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "Attendee not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Attendee not found" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendee retrieved", req.path, 200, req.headers["user-agent"]);

    res.status(200).json(attendee);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};


export const getAttendeesByUserIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;
    const { limit, page, limitPlusOne, offset } = req.pagination;
    const userId = req.user.sub;

    if (!eventId) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing event ID", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Event ID is required" });
    }

    const result = await getAttendeesByUserIdRepository(eventId, userId);


    if (!result || result.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "No attendees found", req.path, 404, req.headers["user-agent"]);
               return res.status(404).json({
      status: "Attendee not found",
    });
    }

        const eventDate = result[0].event?.event_date;

    if (!eventDate) {
      return res.status(500).json({ error: "Event date not found" });
    }

    const eventTimestamp = new Date(eventDate).getTime();
    const now = Date.now();
    
    if(eventTimestamp < now) {
      return res.status(200).json({ status: "Event has passed" });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendees retrieved", req.path, 200, req.headers["user-agent"]);



    return res.status(200).json({
      status: "success"
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};


export const getUserAttendedEventsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { limit, page, limitPlusOne, offset } = req.pagination;

    const userId = req.user.sub;

    const result = await getUserAttendedEventsRepository(userId, limitPlusOne, offset);

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    if (!result || result.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "No events found", req.path, 404, req.headers["user-agent"]);
      return res.status(200).json({
        status: "success",
        currentPage: page,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        totalEvents: events.length,
        data: [],
      });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Events retrieved", req.path, 200, req.headers["user-agent"]);

    return res.status(200).json({
      status: "success",
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalEvents: events.length,
      data: events,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
};

export const searchAttendeesByEventNameTicketNameController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
      const { q } = req.query;
    const searchQuery = q?.trim() || "";
     const userId = req.user.sub;
    // const { limit, page, limitPlusOne, offset } = req.pagination;

    const result = await searchAttendeesByEventNameTicketNameRepository(userId , searchQuery);

    if (!result || result.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "No attendees found", req.path, 404, req.headers["user-agent"]);
      return res.status(200).json(
       []
      );
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Attendees retrieved", req.path, 200, req.headers["user-agent"]);

    return res.status(200).json(
      result,
    );
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
}


export const getAllUserAttendedSpecificEventsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { limit, page, limitPlusOne, offset } = req.pagination;

    const userId = req.user.sub;
    const eventId = req.params.id;

    const result = await getAllUserAttendedSpecificEventRepository( eventId,userId, limitPlusOne, offset);

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    if (!result || result.length === 0) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "INFO", req.ip, req.method, "No events found", req.path, 404, req.headers["user-agent"]);
      return res.status(200).json({
        status: "success",
        currentPage: page,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        totalEvents: events.length,
        data: [],
      });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Events retrieved", req.path, 200, req.headers["user-agent"]);

    return res.status(200).json({
      status: "success",
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalEvents: events.length,
      data: events,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ error: error.message });
  }
}