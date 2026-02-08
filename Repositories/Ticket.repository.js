import {Ticket} from '../Models/index.js';
import {getEventByIdRepository} from './Event.repository.js';
import { Sequelize } from "sequelize";

export const createTicketRepository = async (data , options = {}) => {
  try {
    const ticket = await Ticket.create(data , options);
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const getAllTicketsRepository = async () => {
  try {
    const tickets = await Ticket.findAll();
    return tickets;
  } catch (error) {
    throw error;
  }
};


export const getTicketByIdRepository = async (id) => {
  try {
    const ticket = await Ticket.findByPk(id);
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const getTicketbyEventIdRepository = async (eventId) => {
  try {
    const tickets = await Ticket.findAll({ where: { event_id: eventId } , order: [["created_at", "DESC"]] });
    return tickets;
  } catch (error) {
    throw error;
  }
};

export const updateTicketRepository = async (id, data) => {
  try {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    await ticket.update(data);
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const deleteTicketRepository = async (id , organizer_id) => {
  try {
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return null; 
    }

    // Get organizer is
    const event = await getEventByIdRepository(ticket.event_id);
    const organizer_id_event = event.organizer_id;

    if (organizer_id !== organizer_id_event) {
      throw new Error('Unauthorized: You cannot delete this ticket');
    }



    await ticket.destroy();
    return true; // indicate successful soft delete
  } catch (error) {
    throw error;
  }
};


export const getEventTicketSalesStatsRepository = async (eventId) => {
  const tickets = await Ticket.findAll({
    where: { event_id: eventId },

    attributes: [
      "id",
      "ticket_name",
      "ticket_price",
      "ticket_quantity", // remaining

      [
        Sequelize.literal(`(
          SELECT COALESCE(SUM(a.ticket_quantity), 0)
          FROM attendees a
          WHERE a.ticket_id = tickets.id
        )`),
        "tickets_sold"
      ]
    ],

    order: [["created_at", "ASC"]],
    raw: true
  });

  return tickets.map(ticket => ({
    ticket_id: ticket.id,
    ticket_name: ticket.ticket_name,
    ticket_price: ticket.ticket_price,
    tickets_sold: Number(ticket.tickets_sold),
    tickets_remaining: ticket.ticket_quantity
  }));
};