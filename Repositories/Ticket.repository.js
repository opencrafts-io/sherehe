import {Ticket} from '../Models/index.js';

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
    const tickets = await Ticket.findAll({ where: { delete_tag: false } });
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
    const tickets = await Ticket.findAll({ where: { event_id: eventId , delete_tag: false } , order: [["createdAt", "DESC"]] });
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

export const deleteTicketRepository = async (id) => {
  try {
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return null; // return null instead of throwing (controller handles it)
    }

    await ticket.update({ delete_tag: true });
    return true; // indicate successful soft delete
  } catch (error) {
    throw error;
  }
};
