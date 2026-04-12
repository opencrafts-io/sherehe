import {EventInvite , Event } from '../Models/index.js';
import { Op } from "sequelize";

export const createEventInviteRepository = async (eventInvite , options={}) => {
  try {
    const newEventInvite = await EventInvite.create(eventInvite , options);
    return newEventInvite;
  } catch (error) {
    throw error;
  }
};

export const validateInviteRepository = async (token) => {
  // Find the invite including the event
  const invite = await EventInvite.findOne({ 
    where: { token },
    include: [
      {
        model: Event,
        as: "event"
      },
    ],
  });

  if (!invite) throw new Error("Invalid invite");

  if (invite.expires_at < new Date()) {
    throw new Error("Invite expired");
  }

  if (invite.used_count >= invite.max_uses) {
    throw new Error("Invite limit reached");
  }
  

  // Increment used count
  invite.used_count += 1;
  await invite.save();

        const formattedEvent = {
      ...invite.event.toJSON(),
      event_genre: Array.isArray(invite.event.event_genre)
        ? invite.event.event_genre
        : JSON.parse(invite.event.event_genre || '[]'),
    };

    return formattedEvent;
};

export const deleteeventInviteRepository = async (id) => {
  try {
    const eventInvite = await EventInvite.findByPk(id);
    if (!eventInvite) {
      throw new Error("event invite not found");
    }
    await eventInvite.destroy();
   return { message: "Event invite deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getalleventInviteRepository = async (event_id) => {
  try {
    const eventInvites = await EventInvite.findAll(
      {
        where: {
          event_id: event_id,
        },
      }
    );
    return eventInvites;
  } catch (error) {
    throw error;
  }
};

