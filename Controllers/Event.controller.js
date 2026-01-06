import {
  createEventRepository,
  getAllEventsRepository,
  getEventByIdRepository,
  updateEventRepository,
  deleteEventRepository,
  searchEventRepository,
  getEventbyOrganizerIdRepository
} from "../Repositories/Event.repository.js";

import { createTicketRepository } from "../Repositories/Ticket.repository.js";
import { createPaymentInfoRepository } from "../Repositories/paymentInfo.repository.js";
import { cleanupFiles } from "../Middleware/cleanupFiles.js";
import { processAndSaveImages } from "../Middleware/upload.js";
import sequelize from "../Utils/db.js";
import { randomUUID } from "crypto";
import { sendNotification } from "../Utils/Notification.js";
import { logs } from "../Utils/logs.js";

const generateSheId = () => `she_${randomUUID()}`;

export const createEventController = async (req, res) => {
  const start = process.hrtime.bigint();
  let savedFiles = [];

  try {
    const {
      event_name,
      event_description,
      event_location,
      event_date,
      event_url,
      event_genre,
      payment_type,
      paybill_number,
      account_reference,
      till_number,
      send_money_phone
    } = req.body;

    if (payment_type === "MPESA_PAYBILL" && !paybill_number) {
      return res.status(400).json({ error: "Paybill number is required" });
    }

    if (payment_type === "MPESA_TILL" && !till_number) {
      return res.status(400).json({ error: "Till number is required" });
    }

    if (payment_type === "MPESA_SEND_MONEY" && !send_money_phone) {
      return res.status(400).json({ error: "Send money phone number is required" });
    }

    const organizer_id = req.user.sub;
    let tickets = req.body.tickets;

    const resized = await processAndSaveImages(req);
    savedFiles = Object.values(resized);

    if (!event_name || !event_date || !event_location || !organizer_id) {
      cleanupFiles(savedFiles);

      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Missing event details",
        req.originalUrl,
        422,
        req.headers["user-agent"]
      );

      return res.status(422).json({
        message: "Missing required event details",
      });
    }

    const event_card_image = `${process.env.BASE_URL}/${resized.event_card_image}`;
    const event_poster_image = `${process.env.BASE_URL}/${resized.event_poster_image}`;
    const event_banner_image = `${process.env.BASE_URL}/${resized.event_banner_image}`;

    if (typeof tickets === "string") {
      try {
        tickets = JSON.parse(tickets);
      } catch (error) {
        cleanupFiles(savedFiles);

        const duration = Number(process.hrtime.bigint() - start);

        logs(
          duration,
          "ERROR",
          req.ip,
          req.method,
          "Invalid ticket JSON",
          req.originalUrl,
          400,
          req.headers["user-agent"]
        );

        return res.status(400).json({ error: "Invalid JSON format for tickets" });
      }
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      cleanupFiles(savedFiles);

      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "No ticket types provided",
        req.originalUrl,
        422,
        req.headers["user-agent"]
      );

      return res.status(422).json({
        error: "At least one ticket type is required",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const event = await createEventRepository(
        {
          event_name,
          event_description,
          event_location,
          event_date,
          event_url,
          event_genre,
          event_card_image,
          event_poster_image,
          event_banner_image,
          organizer_id,
        },
        { transaction }
      );

      for (const ticket of tickets) {
        await createTicketRepository(
          { ...ticket, event_id: event.id },
          { transaction }
        );
      }

      await transaction.commit();

      // Notify user
      const formattedEventDate = new Date(event.event_date).toLocaleDateString(
        "en-GB",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      const contents = {
        en: `Hello,\n\nYour event "${event.event_name}" has been successfully created and is scheduled on ${formattedEventDate}.\n\nYou can manage or share your event using the dashboard.`,
      };

      const notificationPayload = {
        notification: {
          app_id: "88ca0bb7-c0d7-4e36-b9e6-ea0e29213593",
          headings: { en: "Event Created Successfully!" },
          contents,
          target_user_id: organizer_id,
          include_external_user_ids: [],
          subtitle: { en: "Your event is now live" },
          android_channel_id: "60023d0b-dcd4-41ae-8e58-7eabbf382c8c",
          ios_sound: "pay",
          big_picture: event_banner_image,
          large_icon: event_card_image,
          small_icon: event_poster_image,
          url: event_url || "https://opencrafts.io/dashboard",
          buttons: [{ id: event.id, text: "View Event", icon: "" }],
        },
        meta: {
          event_type: "notification.requested",
          source_service_id: "io.opencrafts.verisafe",
          request_id: generateSheId(),
        },
      };

      sendNotification(notificationPayload);

      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "INFO",
        req.ip,
        req.method,
        "Event created successfully",
        req.originalUrl,
        201,
        req.headers["user-agent"]
      );

      const savepayment = createPaymentInfoRepository({
        event_id: event.id,
        payment_type,
        paybill_number,
        paybill_account_number: account_reference,
        till_number,
        phone_number: send_money_phone
      })

      if (!savepayment) {
        return res.status(500).json({
          error: "Failed to save payment info",
        });
      }

      return res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      await transaction.rollback();
      cleanupFiles(savedFiles);

      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "ERROR",
        req.ip,
        req.method,
        error.message,
        req.originalUrl,
        500,
        req.headers["user-agent"]
      );

      return res.status(500).json({
        error: "Database transaction failed",
        details: error.message,
      });
    }
  } catch (error) {
    cleanupFiles(savedFiles);

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({
      error: "Unexpected server error",
      details: error.message,
    });
  }
};

export const getAllEventsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { limit, page, limitPlusOne, offset } = req.pagination;

    const result = await getAllEventsRepository({ limitPlusOne, offset });

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Fetched all events",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      status: "success",
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalEvents: events.length,
      data: events,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve events",
      details: error.message,
    });
  }
};

export const getEventByIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;
    const event = await getEventByIdRepository(eventId);

    if (!event) {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Event not found",
        req.originalUrl,
        404,
        req.headers["user-agent"]
      );

      return res.status(404).json({ error: "Event not found" });
    }

    if (event.delete_tag === true) {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Event deleted",
        req.originalUrl,
        410,
        req.headers["user-agent"]
      );

      return res.status(410).json({ error: "Event has been deleted" });
    }

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Fetched event by ID",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    return res.status(200).json(event);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEventController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;
    const userId = req.user?.sub || req.body.userId;
    const eventData = req.body;

    const result = await updateEventRepository(eventId, eventData, userId);

    if (result.status === "not_found") {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Event not found",
        req.originalUrl,
        404,
        req.headers["user-agent"]
      );

      return res.status(404).json({ error: "Event not found" });
    }

    if (result.status === "deleted") {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Event deleted",
        req.originalUrl,
        410,
        req.headers["user-agent"]
      );

      return res.status(410).json({ error: "Event has been deleted" });
    }

    if (result.status === "unauthorized") {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Unauthorized event update attempt",
        req.originalUrl,
        403,
        req.headers["user-agent"]
      );

      return res.status(403).json({
        error: "Unauthorized: You cannot update this event",
      });
    }

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Event updated",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      message: "Event updated successfully",
      data: result.event,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteEventController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const eventId = req.params.id;
    const userId = req.user?.sub;
    const result = await deleteEventRepository(eventId, userId);

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Event deleted",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    return res.status(200).json(result);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    if (error.message === "Event not found") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Event already deleted") {
      return res.status(409).json({ error: error.message });
    }

    if (error.message.startsWith("Unauthorized")) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const searchEventController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { q } = req.query;
    const searchQuery = q?.trim() || "";

    if (!searchQuery) {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Missing search query",
        req.originalUrl,
        400,
        req.headers["user-agent"]
      );

      return res
        .status(400)
        .json({ error: "Missing search query parameter (?q=...)" });
    }

    const results = await searchEventRepository(searchQuery);

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Search performed",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    if (!results || results.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json({
      count: results.length,
      data: results,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({
      error: "Internal server error while searching events",
    });
  }
};



export const getEventbyOrganizerIdController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const organizerId = req.params.id;

    if (!organizerId) {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Organizer ID missing",
        req.originalUrl,
        400,
        req.headers["user-agent"]
      );

      return res.status(400).json({ error: "Organizer ID is required" });
    }

    const events = await getEventbyOrganizerIdRepository(organizerId);

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Fetched events by organizer",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

    if (!events || events.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json({
      count: events.length,
      data: events,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "ERROR",
      req.ip,
      req.method,
      error.message,
      req.originalUrl,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({
      error: "Internal server error while fetching events by organizer ID",
    });
  }
};
