import {ScannedTickets} from '../Models/index.js';

export const getAllScannedTicketsByEventIdRepository = async (id) => {
  try {
    return await ScannedTickets.findAll({
    where: {
      event_id: id
    }
  });
  } catch (error) {
    throw error;
  }
}

export const getAllScannedTicketsByScannerIdRepository = async (id) => {
  try {
    return await ScannedTickets.findAll({
    where: {
      scanner_id: id
    }
  });
  } catch (error) {
    throw error;
  }
}

export const getAllScannedTicketsByAttendeeIdandTicketIdRepository = async (id , ticket_id) => {
  try {
    return await ScannedTickets.findAll({
    where: {
      attendee_id: id,
      ticket_id: ticket_id
    }
  });
  } catch (error) {
    throw error;
  }
}

export const createscannedTicketRepository = async (data) => {
  try {
    const scannedTicket = await ScannedTickets.create(data);
    return scannedTicket;
  } catch (error) {
    throw error;
  }
}