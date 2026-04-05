import { TicketInvite, Ticket } from '../Models/index.js';
import { Op } from "sequelize";

export const createTicketInviteRepository = async (TicketInvite, options = {}) => {
  try {
    const newTicketInvite = await TicketInvite.create(TicketInvite, options);
    return newTicketInvite;
  } catch (error) {
    throw error;
  }
};

export const validateInviteRepository = async (token) => {
  // Find the invite including the Ticket
  const invite = await TicketInvite.findOne({
    where: { token },
    include: [
      {
        model: Ticket,
        as: "Ticket"
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

  return invite.Ticket;
};

