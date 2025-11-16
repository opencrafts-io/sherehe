import { createEventRepository, getAllEventsRepository, getEventByIdRepository, updateEventRepository, deleteEventRepository, searchEventRepository, getEventbyOrganizerIdRepository } from '../Repositories/Event.repository.js';
import { createTicketRepository } from '../Repositories/Ticket.repository.js';
import { cleanupFiles } from '../Middleware/cleanupFiles.js';
import { processAndSaveImages } from '../Middleware/upload.js';
import sequelize from '../Utils/db.js';
import { randomUUID } from 'crypto'; // For generating unique request_id
import { sendNotification } from '../Utils/Notification.js';
const generateSheId = () => `she_${randomUUID()}`;


export const createEventController = async (req, res) => {
  let savedFiles = [];

  try {
    const {
      event_name,
      event_description,
      event_location,
      event_date,
      event_url,
      event_genre,
    } = req.body;


    const organizer_id = req.user.sub;

    let tickets = req.body.tickets;

    // ✅ Validate required files
    if (
      !req.files ||
      !req.files.event_card_image ||
      !req.files.event_poster_image ||
      !req.files.event_banner_image
    ) {
      return res.status(400).json({
        message: "Event card image, poster, and banner are required",
      });
    }

    // ✅ Resize and save all images (done in memory, no originals saved)
    const resized = await processAndSaveImages(req);
    savedFiles = Object.values(resized);

    // ✅ Validate event data
    if (!event_name || !event_date || !event_location || !organizer_id) {
      cleanupFiles(savedFiles);
      return res
        .status(422)
        .json({ message: "Missing required event details" });
    }

    const event_card_image = `${process.env.BASE_URL}/${resized.event_card_image}`;
    const event_poster_image = `${process.env.BASE_URL}/${resized.event_poster_image}`;
    const event_banner_image = `${process.env.BASE_URL}/${resized.event_banner_image}`;

    // ✅ Parse and validate tickets
    if (typeof tickets === "string") {
      try {
        tickets = JSON.parse(tickets);
      } catch (error) {
        cleanupFiles(savedFiles);
        return res.status(400).json({ error: "Invalid JSON format for tickets" });
      }
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      cleanupFiles(savedFiles);
      return res
        .status(422)
        .json({ error: "At least one ticket type is required" });
    }

    // ✅ Database transaction
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
      // Send Notification to Organizer

      const formattedEventDate = new Date(event.event_date).toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const contents = {
        en: `Hello,\n\nYour event "${event.event_name}" has been successfully created and is scheduled on ${formattedEventDate}.\n\nYou can manage or share your event using the dashboard.`
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
          buttons: [
            { id: event.id, text: "View Event", icon: "" }
          ]
        },
        meta: {
          event_type: "notification.requested",
          source_service_id: "io.opencrafts.verisafe",
          request_id: generateSheId()
        }
      };

      sendNotification(notificationPayload);

      return res
        .status(201)
        .json({ message: "Event created successfully", event });
    } catch (error) {
      await transaction.rollback();
      cleanupFiles(savedFiles);
      return res
        .status(500)
        .json({ error: "Database transaction failed", details: error.message });
    }
  } catch (error) {
    cleanupFiles(savedFiles);
    return res
      .status(500)
      .json({ error: "Unexpected server error", details: error.message });
  }
};


export const getAllEventsController = async (req, res) => {
  try {
    const { limit, page, limitPlusOne, offset } = req.pagination;

    const result = await getAllEventsRepository({ limitPlusOne, offset });

    const hasNextPage = result.length > limit;
    const events = hasNextPage ? result.slice(0, limit) : result;

    // No events found at all
    if (!result || result.length === 0) {
      return res.status(200).json({
        status: "success",
        currentPage: page,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        totalEvents: events.length,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      currentPage: page,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalEvents: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res
      .status(500) // ✅ Internal Server Error
      .json({
        status: "error",
        message: "Failed to retrieve events",
        details: error.message,
      });
  }
};

export const getEventByIdController = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await getEventByIdRepository(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.delete_tag === true) {
      return res.status(410).json({ error: "Event has been deleted" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const updateEventController = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.sub || req.body.userId; // Depending on your auth setup
    const eventData = req.body;

    const result = await updateEventRepository(eventId, eventData, userId);

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Event not found" });
    }

    if (result.status === "deleted") {
      return res.status(410).json({ error: "Event has been deleted" });
    }

    if (result.status === "unauthorized") {
      return res.status(403).json({ error: "Unauthorized: You cannot update this event" });
    }

    return res.status(200).json({
      message: "Event updated successfully",
      data: result.event,
    });

  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteEventController = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.sub
    const result = await deleteEventRepository(eventId, userId);
    return res.status(200).json(result); // success
  } catch (error) {
    // handle specific error messages with proper HTTP codes
    if (error.message === "Event not found") {
      return res.status(404).json({ error: error.message }); // Not Found
    }

    if (error.message === "Event already deleted") {
      return res.status(409).json({ error: error.message }); // Conflict
    }

    if (error.message.startsWith("Unauthorized")) {
      return res.status(403).json({ error: error.message }); // Forbidden
    }

    // Default for unexpected errors
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const searchEventController = async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = q?.trim() || "";

    // If no query is provided, it's a bad request
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing search query parameter (?q=...)" });
    }

    const results = await searchEventRepository(searchQuery);

    if (!results || results.length === 0) {
      // No results found, return 204 No Content
      return res.status(200).json([]);
    }

    // Success
    return res.status(200).json({
      count: results.length,
      data: results,
    });

  } catch (error) {
    console.error("Error searching events:", error);
    return res.status(500).json({
      error: "Internal server error while searching events",
    });
  }
};

export const getEventbyOrganizerIdController = async (req, res) => {
  try {
    const organizerId = req.params.id;

    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required" });
    }

    const events = await getEventbyOrganizerIdRepository(organizerId);

    if (!events || events.length === 0) {
      return res.status(404).json([]);
    }

    return res.status(200).json({
      count: events.length,
      data: events,
    });

  } catch (error) {
    console.error("Error fetching events by organizer ID:", error);
    return res.status(500).json({
      error: "Internal server error while fetching events by organizer ID",
    });
  }
};
