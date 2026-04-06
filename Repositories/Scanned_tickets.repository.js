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

export const createScannedTicketRepository = async (data) => {
  try {
    const scannedTicket = await ScannedTickets.create(data);
    return scannedTicket;
  } catch (error) {
    throw error;
  }
}

export const findOrCreateScannedTicketRepository = async ({ event_id, attendee_id, ticket_id, scanner_id, ticket_quantity }) => {
  try {
    const [scannedTicket, created] = await ScannedTickets.findOrCreate({
      where: {
        event_id,
        attendee_id,
        ticket_id
      },
      defaults: {
        scanner_id,
        ticket_quantity
      }
    });
    return { scannedTicket, created };
  } catch (error) {
    throw error;
  }
}
