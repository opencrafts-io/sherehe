import {EventInvite , Event , EventInstitution } from '../Models/index.js';
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
  const invite = await EventInvite.findOne({
    where: { token },
    include: [
      {
        model: Event,
        as: "event",
        include: [
          {
            model: EventInstitution,
            as: "event_institutions",
            attributes: ["institution_id"],
            required: false,
          },
        ],
      },
    ],
  });

  if (!invite) {
    throw new Error("Invalid invite");
  }

  if (invite.expires_at < new Date()) {
    throw new Error("Invite expired");
  }

  if (invite.used_count >= invite.max_uses) {
    throw new Error("Invite limit reached");
  }

  // Increment used count
  invite.used_count += 1;
  await invite.save();

  const json = invite.event.toJSON();

  const formattedEvent = {
    ...json,
    event_genre: Array.isArray(json.event_genre)
      ? json.event_genre
      : JSON.parse(json.event_genre || "[]"),
  };

  delete formattedEvent.event_institutions;

  if (json.scope === "institution") {
    formattedEvent.institutions = (json.event_institutions || []).map(
      inst => String(inst.institution_id)
    );
  }

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
        include: [
          {
            model: Event,
            as: "event",
            attributes: ["id", "event_name"],
          },
        ],
      }
    );
    return eventInvites;
  } catch (error) {
    throw error;
  }
};


export const updateeventInviteRepository = async (id, data) => {
  try {
    const eventInvite = await EventInvite.findByPk(id);
    if (!eventInvite) {
      throw new Error("event invite not found");
    }
    await eventInvite.update(data);
    return eventInvite;
  } catch (error) {
    throw error;
  }
};