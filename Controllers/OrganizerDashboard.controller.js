import { getTicketByIdRepository, updateTicketRepository } from '../Repositories/Ticket.repository.js';
import { getEventByIdRepository } from '../Repositories/Event.repository.js';
import { logs } from '../Utils/logs.js';
// import { getUserByIdRepository } from '../Repositories/User.repository.js';
// import { sendPaymentRequest } from '../Middleware/Veribroke_sdk_push.js';
// import { createTransactionRepository, getTransactionByIdRepository } from '../Repositories/Transactions.repository.js';
// import { getPaymentInfoByEventIdRepository } from '../Repositories/paymentInfo.repository.js';
import { createAttendeeRepository, getTotalAttendeesByEventIdRepository , getAttendeesByTicketIdRepository } from '../Repositories/Attendee.repository.js';
import { getTotalScannersByEventIdRepository } from '../Repositories/eventScanners.repository.js';
import {getEventTicketSalesStatsRepository} from '../Repositories/Ticket.repository.js';
import { Op, Sequelize } from "sequelize";


export const getEventStatsController = async (req, res) => {
  try {
    const event_id = req.params.id;
    // Get total number of attendees
    const attendees = await getTotalAttendeesByEventIdRepository(event_id);
    const scanners = await getTotalScannersByEventIdRepository(event_id);

    res.status(200).json({
      attendees: attendees,
      scanners: scanners
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getTicketStatsController = async (req, res) => {
  try {
    const event_id = req.params.id;
    const event = await getEventTicketSalesStatsRepository(event_id);

   return res.status(200).json(event);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getAttendeesByTicketIdController = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const attendees = await getAttendeesByTicketIdRepository(ticketId);
    res.status(200).json(attendees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}