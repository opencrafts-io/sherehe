import { Event , PaymentInfo } from '../Models/index.js';
import { Op } from "sequelize";

import {updateUserRepository} from '../Repositories/User.repository.js';

export const createEventRepository = async (eventData , options = {}) => {
  try {
    const event = await Event.create(eventData , options);
        const formattedEvent = {
      ...event.toJSON(),
      event_genre: Array.isArray(event.event_genre)
        ? event.event_genre
        : JSON.parse(event.event_genre || '[]'),
    };

    return formattedEvent;
  } catch (error) {
    throw error;
  }
};

export const getAllEventsRepository = async (params) => {
  try {
    // Check delete_tag is false
    const { limitPlusOne, offset } = params;
    const events = await Event.findAll({include: [{ model: PaymentInfo, as: "payment_info" , attributes: {
      exclude: ["event_id"]
    } }], order: [["created_at", "DESC"]] , limit: limitPlusOne, offset: offset });
    const formattedEvents = events.map(event => ({
  ...event.toJSON(),
  event_genre: Array.isArray(event.event_genre)
    ? event.event_genre
    : JSON.parse(event.event_genre || '[]')
}));

    return formattedEvents;
  } catch (error) {
    throw error;
  }
};

export const getEventByIdRepository = async (eventId) => {
  try {
    const event = await Event.findByPk(eventId , {include: [{ model: PaymentInfo, as: "payment_info" , attributes: {
      exclude: ["event_id"]
    } }] });

    if (!event) return null;

    const formattedEvent = {
      ...event.toJSON(),
      event_genre: Array.isArray(event.event_genre)
        ? event.event_genre
        : JSON.parse(event.event_genre || '[]'),
    };

    return formattedEvent;
  } catch (error) {
    throw error;
  }
};

export const updateEventRepository = async (eventId, eventData, userId) => {
  try {
    const event = await Event.findByPk(eventId);

    if (!event) {
      return { status: "not_found" };
    }

    // Optional: Only allow the event creator/organizer to update
    if (event.organizer_id !== userId) {
      return { status: "unauthorized" };
    }

    await event.update(eventData);

    const formattedEvent = {
      ...event.toJSON(),
      event_genre: Array.isArray(event.event_genre)
        ? event.event_genre
        : JSON.parse(event.event_genre || '[]'),
    };

    return { status: "success", event: formattedEvent };
  } catch (error) {
    throw error;
  }
};


export const deleteEventRepository = async (eventId, userId) => {
  try {
    // Find the event by ID
    const event = await Event.findByPk(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.delete_tag === true) {
  throw new Error("Event already deleted");
    }


    // Optional: Check if the user is authorized to delete the event
    if (event.organizer_id !== userId) {
      throw new Error("Unauthorized: You cannot delete this event");
    }

    // Soft delete by updating the delete_tag flag
    await event.destroy()

    return { message: "Event deleted successfully" };
  } catch (error) {
    throw error;
  }
};



export const searchEventRepository = async (searchQuery) => {
  try {
    const events = await Event.findAll({
      where: {
        [Op.or]: [
          { event_name: { [Op.iLike]: `%${searchQuery}%` } },
          { event_description: { [Op.iLike]: `%${searchQuery}%` } },
          { event_location: { [Op.iLike]: `%${searchQuery}%` } },
        ],
      },
      order: [["created_at", "DESC"]],
    });
    const formattedEvents = events.map(event => ({
  ...event.toJSON(),
  event_genre: Array.isArray(event.event_genre)
    ? event.event_genre
    : JSON.parse(event.event_genre || '[]')
}));
    return formattedEvents;
  } catch (error) {
    throw error;
  }
};


export const getEventbyOrganizerIdRepository = async (organizerId) => {
  try {
    const events = await Event.findAll({ where: { organizer_id: organizerId}, include: [{ model: PaymentInfo, as: "payment_info" , attributes: {
      exclude: ["event_id"]
    } }] , order: [["created_at", "DESC"]] });
        const formattedEvents = events.map(event => ({
  ...event.toJSON(),
  event_genre: Array.isArray(event.event_genre)
    ? event.event_genre
    : JSON.parse(event.event_genre || '[]')
}));
    return formattedEvents;
  } catch (error) {
    throw error;
  }
};



