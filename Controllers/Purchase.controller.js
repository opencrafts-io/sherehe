import { getTicketByIdRepository } from '../Repositories/Ticket.repository.js';
import { getEventByIdRepository } from '../Repositories/Event.repository.js';
import { randomUUID } from 'crypto';
import { logs } from '../Utils/logs.js';
import { getUserByIdRepository } from '../Repositories/User.repository.js';

import { sendPaymentRequest } from '../Middleware/Veribroke_sdk_push.js';

const generateSheId = () => `she_${randomUUID()}`;



export const purchaseTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const user_id = req.user?.sub;
    const ticket_quantity = req.body.ticket_quantity;
    const user_phone = req.body.user_phone;
    const ticket_id = req.body.ticket_id;

    // Missing fields
    if (!user_id || !ticket_quantity || !ticket_id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing required fields", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ticket = await getTicketByIdRepository(ticket_id);

    if (!ticket) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Ticket not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check quantity
    if (ticket_quantity > ticket.ticket_quantity) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Not enough tickets available", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const event_id = ticket.event_id;
    const event = await getEventByIdRepository(event_id);

    const user = await getUserByIdRepository(user_id);

    if (!event) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Event not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Event not found" });
    }

    let phoneNumber = user.phone || user_phone;

    if (phoneNumber.startsWith("0")) {
      phoneNumber = "254" + phoneNumber.slice(1); // replace leading 0 with 254
    } else if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.slice(1); // remove leading +
    }

    const paymentData = {
      "request_id": generateSheId(),
      "phone_number": phoneNumber,
      "trans_amount": ticket_quantity * ticket.ticket_price,
      "service_name": "SHERHE",
      "trans_desc": `Ticket purchase for ${ticket_quantity} ticket(s) to ${event.event_name}`,
      "reply_to": process.env.SHEREHE_ROUTING_KEY,
    }


    await sendPaymentRequest(paymentData);



    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Ticket purchased successfully", req.path, 201, req.headers["user-agent"]);

    res.status(200).json({
      message: "Sdk request sent successfully",
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ message: error.message });
  }
};
