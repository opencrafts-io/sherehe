import {
  createEventRepository,
  getAllEventsRepository,
  getEventByIdRepository,
  updateEventRepository,
  deleteEventRepository,
  searchEventRepository,
  getEventbyOrganizerIdRepository,
  getEventByTagsRepository
} from "../Repositories/Event.repository.js";

import { createTicketRepository } from "../Repositories/Ticket.repository.js";
import { createPaymentInfoRepository } from "../Repositories/paymentInfo.repository.js";
import { processAndSaveImages } from "../Middleware/upload.js";
import sequelize from "../Utils/db.js";
import { sendNotification } from "../Utils/Notification.js";
import { createEventScannerRepository } from "../Repositories/eventScanners.repository.js";
import { logs } from "../Utils/logs.js";
import { createEventInstitutionRepository } from "../Repositories/event_institution.repository.js";
import { createEventInviteRepository } from '../Repositories/event_invite.repository.js';
import crypto from "crypto";;
import { getAllUserInstitutionRepository } from '../Repositories/user_institution.repository.js';
import { sendPlainEmail } from '../Services/gossip_monger_email.js';
import { getUserByIdRepository } from '../Repositories/User.repository.js';
import { sendUserPushNotification } from '../Services/gossip_monger_push_notification.js';
import {sendEventConfirmedEmail} from '../Utils/Email.js'
export const createEventController = async (req, res) => {
  const start = process.hrtime.bigint();
  let savedFiles = [];
  let transaction;

  try {
    let {
      event_name,
      event_description,
      event_location,
      start_date,
      end_date,
      event_url,
      event_genre,
      payment_type,
      paybill_number,
      account_reference,
      till_number,
      send_money_phone,
      scope,
      institutions
    } = req.body;

    const organizer_id = req.user.sub;
    let tickets = req.body.tickets;
    // -------------------------
    // VALIDATIONS
    // -------------------------
    if (payment_type === "MPESA_PAYBILL" && !paybill_number) {
      return res.status(400).json({ error: "Paybill number is required" });
    }

    if (payment_type === "MPESA_TILL" && !till_number) {
      return res.status(400).json({ error: "Till number is required" });
    }

    if (payment_type === "MPESA_SEND_MONEY" && !send_money_phone) {
      return res.status(400).json({ error: "Send money phone number is required" });
    }

    if (!event_name || !start_date || !end_date || !event_location || !organizer_id) {
      return res.status(422).json({
        message: "Missing required event details",
      });
    }

    const parsedInstitutions =
  typeof institutions === "string"
    ? JSON.parse(institutions)
    : institutions;

const parsedTickets =
  typeof tickets === "string"
    ? JSON.parse(tickets)
    : tickets;
if (scope === "institution") {
  const eventInstitutions = new Set(parsedInstitutions);

  for (const ticket of parsedTickets) {
    if (ticket.scope !== "institution") continue;

    for (const ticketInstitution of ticket.institutions) {
      if (!eventInstitutions.has(ticketInstitution)) {
        throw new Error(
          `Ticket institution ${ticketInstitution} is not part of the event institutions`
        );
      }
    }
  }
}

    // -------------------------
    // IMAGE PROCESSING
    // -------------------------
    const resized = await processAndSaveImages(req);
    const { event_card_image, event_poster_image, event_banner_image } = req.images;
    // -------------------------
    // TICKETS PARSING
    // -------------------------
    if (typeof tickets === "string") {
      try {
        tickets = JSON.parse(tickets);
      } catch {
        return res.status(400).json({
          error: "Invalid JSON format for tickets",
        });
      }
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(422).json({
        error: "At least one ticket type is required",
      });
    }

    // =====================================================
    // 🔒 TRANSACTION — EVENT + TICKETS ONLY
    // =====================================================
    transaction = await sequelize.transaction();

    let event;

    try {
      event = await createEventRepository(
        {
          event_name,
          event_description,
          event_location,
          start_date,
          end_date,
          event_url,
          event_genre,
          event_card_image,
          event_poster_image,
          event_banner_image,
          organizer_id,
          scope
        },
        { transaction }
      );

      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);

      if (eventStart >= eventEnd) {
        throw new Error(`Event "${event.event_name}" must start before it ends.`);
      }

      for (const ticket of tickets) {
        const ticketStart = ticket.start_date ? new Date(ticket.start_date) : new Date(start_date);
        const ticketEnd = ticket.end_date ? new Date(ticket.end_date) : new Date(end_date);
        const eventStart = new Date(event.start_date);
        const eventEnd = new Date(event.end_date);

        if (ticketStart && ticketStart < eventStart) {
          throw new Error(`Ticket "${ticket.ticket_name}" starts before the event starts.`);
        }

        if (ticketEnd && ticketEnd > eventEnd) {
          throw new Error(`Ticket "${ticket.ticket_name}" ends after the event ends.`);
        }

        if (ticketStart && ticketEnd && ticketStart >= ticketEnd) {
          throw new Error(`Ticket "${ticket.ticket_name}" start date must be before its end date.`);
        }
        await createTicketRepository(
          { ...ticket, event_id: event.id },
          { transaction }
        );

      }
      if (typeof institutions === "string") {
        institutions = JSON.parse(institutions);
      }
      if (scope === "institution") {
        for (const institution of institutions) {
          await createEventInstitutionRepository({
            event_id: event.id,
            institution_id: institution
          }, { transaction })
        }
      }
      const token = crypto.randomBytes(32).toString("hex");
      if (scope === "private") {
        await createEventInviteRepository({
          event_id: event.id,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }, { transaction })
      }

      if (!(payment_type === null || payment_type === undefined)) {
        const savepayment = await createPaymentInfoRepository({
          event_id: event.id,
          payment_type,
          paybill_number,
          paybill_account_number: account_reference,
          till_number,
          phone_number: send_money_phone
        }, { transaction });
        if (!savepayment) {
          return res.status(500).json({
            error: "Event created but payment info failed to save",
          });
        }
      }

      const eventOrganizer =
      {
        event_id: event.id,
        user_id: organizer_id,
        role: "SUPERVISOR"
      }

      await createEventScannerRepository(eventOrganizer, { transaction })



      await transaction.commit();
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }

    // =====================================================
    // ✅ POST-COMMIT OPERATIONS (NO ROLLBACK HERE)
    // =====================================================






    // -------------------------
    // NOTIFICATION (SAFE)
    // -------------------------
    const formattedEventDate = new Date(event.start_date).toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const organizer_email = await getUserByIdRepository(organizer_id);

                const ticketEmail = await sendEventConfirmedEmail(
                  organizer_email.name,
                  event.event_name,
                  event.event_description,
                  event.event_location,
                  event.start_date,
                  event.end_date,
                  event.event_banner_image,
                  event.scope,
                  event.created_at
                  )

    const emailPayload ={
              to_addresses: [organizer_email.email],
              subject: `Event Confirmation: ${event.event_name}`,
              body_html: ticketEmail,
              body_text: `Congratulations! ${event.event_name} is officially published and live on Academia.Thank you for bringing your event to our platform. All event details, location, and scheduling information are now active for attendees.`
            }; 

    try {
      await sendPlainEmail(emailPayload, "io.opencrafts.sherehe");
    } catch (emailError) {
      logs(
        Number(process.hrtime.bigint() - start),
        "ERROR",
        req.ip,
        req.method,
        `Event created successfully but failed to send confirmation email: ${emailError.message}`,
        req.originalUrl,
        201,
        req.headers["user-agent"]
      );
    }

    const pushNotificationPayload = {
      headings: `New Event: ${event.event_name}`,
      contents: "Your Event has been created successfully and is now live",
      target_user_id: organizer_id,
    }

    try {
      await sendUserPushNotification(pushNotificationPayload, "io.opencrafts.sherehe");
    } catch (error) {
      logs(
        Number(process.hrtime.bigint() - start),
        "ERROR",
        req.ip,
        req.method,
        `Event created successfully but failed to send push notification: ${error.message}`,
        req.originalUrl,
        201,
        req.headers["user-agent"]
      );
    }
    // sendNotification(notificationPayload);

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


    return res.status(201).json({
      message: "Event created successfully",
      data: {
        event,
      },
    })

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
    

    return res.status(400).json({
      error: "Unexpected error",
      details: error.message,
    });
  }
};


export const getAllEventsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { limit, page, limitPlusOne, offset } = req.pagination;
    const user_id = req.user.sub;
    const { institutionIds } = await getAllUserInstitutionRepository(user_id);


    const result = await getAllEventsRepository({ limitPlusOne, offset }, institutionIds, user_id);

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


export const getEventByTagsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const tags = req.params.tags?.split(",") || [];

    if (tags.length === 0) {
      const duration = Number(process.hrtime.bigint() - start);

      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Tags missing",
        req.originalUrl,
        400,
        req.headers["user-agent"]
      );

      return res.status(400).json({ error: "Tags are required" });
    }

    const events = await getEventByTagsRepository(tags);

    const duration = Number(process.hrtime.bigint() - start);

    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      "Fetched events by tags",
      req.originalUrl,
      200,
      req.headers["user-agent"]
    );

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
      error: "Internal server error while fetching events by tags",
    });
  }
};
