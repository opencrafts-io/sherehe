import {EventInvite } from '../Models/index.js';
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
  const invite = await EventInvite.findOne({ where: { token } });

  if (!invite) throw new Error("Invalid invite");

  if (invite.expires_at < new Date()) {
    throw new Error("Invite expired");
  }

  if (invite.used_count >= invite.max_uses) {
    throw new Error("Invite limit reached");
  }

  invite.used_count += 1;
  await invite.save();

  return invite.event_id;
};

