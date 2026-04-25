import { TicketInvite, Ticket } from '../Models/index.js';
import { Op } from "sequelize";

export const createTicketInviteRepository = async (ticketInvite, options = {}) => {
  try {
    const newTicketInvite = await TicketInvite.create(ticketInvite, options);
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
        as: "ticket",
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
  console.log(invite);

  return invite.ticket;
};

export const deleteTicketInviteRepository = async (id) => {
  try {
    const ticketInvite = await TicketInvite.findByPk(id);
    if (!ticketInvite) {
      throw new Error("Ticket invite not found");
    }
    await ticketInvite.destroy();
   return { message: "Ticket invite deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getallTicketInviteRepository = async (ticket_id) => {
  try {
    const ticketInvites = await TicketInvite.findAll(
      {
        where: {
          ticket_id: ticket_id,
        },
      }
    );
    return ticketInvites;
  } catch (error) {
    throw error;
  }
};

