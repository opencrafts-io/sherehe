import { logs } from '../Utils/logs.js';
import { getTotalAttendeesByEventIdRepository , getAttendeesByTicketIdRepository } from '../Repositories/Attendee.repository.js';
import { getTotalScannersByEventIdRepository } from '../Repositories/eventScanners.repository.js';
import {getEventTicketSalesStatsRepository} from '../Repositories/Ticket.repository.js';


export const getEventStatsController = async (req, res) => {
   const start = process.hrtime.bigint();
  try {
    const event_id = req.params.id;
    // Get total number of attendees
    const attendees = await getTotalAttendeesByEventIdRepository(event_id);
    const scanners = await getTotalScannersByEventIdRepository(event_id);

        const end = process.hrtime.bigint();
    const durationMicroseconds = Number(end - start) / 1000;

    logs(
      durationMicroseconds,
      "INFO",
      req.ip,
      req.method,
      "Event stats fetched successfully",
      req.originalUrl,
      201,
      req.headers["user-agent"]
    );

    res.status(200).json({
      attendees: attendees,
      scanners: scanners
    });
  } catch (error) {
        const end = process.hrtime.bigint();
    const durationMicroseconds = Number(end - start) / 1000;

    logs(
      durationMicroseconds,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getTicketStatsController = async (req, res) => {
    const start = process.hrtime.bigint();
  try {
    const event_id = req.params.id;
    const event = await getEventTicketSalesStatsRepository(event_id);

        const end = process.hrtime.bigint();
        const durationMicroseconds = Number(end - start) / 1000;
    
        logs(
          durationMicroseconds,
          "INFO",
          req.ip,
          req.method,
          "Ticket stats fetched successfully",
          req.originalUrl,
          201,
          req.headers["user-agent"]
        );

   return res.status(200).json(event);
    
  } catch (error) {
        const end = process.hrtime.bigint();
    const durationMicroseconds = Number(end - start) / 1000;

    logs(
      durationMicroseconds,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getAttendeesByTicketIdController = async (req, res) => {
   const start = process.hrtime.bigint();
  try {
    const ticketId = req.params.id;
    const attendees = await getAttendeesByTicketIdRepository(ticketId);

        const end = process.hrtime.bigint();
    const durationMicroseconds = Number(end - start) / 1000;

    logs(
      durationMicroseconds,
      "INFO",
      req.ip,
      req.method,
      "Attendees fetched successfully",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    res.status(200).json(attendees);
  } catch (error) {
        const end = process.hrtime.bigint();
    const durationMicroseconds = Number(end - start) / 1000;

    logs(
      durationMicroseconds,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );
    res.status(500).json({ error: 'Internal server error' });
  }
}