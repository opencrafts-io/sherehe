import { getTicketByIdRepository, updateTicketRepository } from '../Repositories/Ticket.repository.js';
import { createAttendeeRepository } from '../Repositories/Attendee.repository.js';
import { sendNotification } from '../Utils/Notification.js';
import { getEventByIdRepository } from '../Repositories/Event.repository.js';
import { randomUUID } from 'crypto';
import { logs } from '../Utils/logs.js';

const generateSheId = () => `she_${randomUUID()}`;

export const purchaseTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const user_id = req.user?.sub;
    const ticket_quantity = req.body.ticket_quantity;
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

    if (!event) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Event not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Event not found" });
    }

    // Create attendee record
    const attendee = await createAttendeeRepository({
      ticket_id,
      user_id,
      ticket_quantity,
      event_id,
    });

    // Update ticket count
    await updateTicketRepository(ticket_id, {
      ticket_quantity: ticket.ticket_quantity - ticket_quantity,
    });

    const eventDate = new Date(event.event_date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const contents = {
      en: `Hello,\n\nYou have successfully purchased ${ticket_quantity} ticket(s) for "${event.event_name}" scheduled on ${eventDate}.\n\nThank you for your purchase!`,
    };

    const notificationPayload = {
      notification: {
        app_id: "88ca0bb7-c0d7-4e36-b9e6-ea0e29213593",
        headings: { en: "Ticket Purchase Successful!" },
        contents,
        target_user_id: user_id,
        include_external_user_ids: [],
        subtitle: { en: "Thank you for your purchase" },
        android_channel_id: "60023d0b-dcd4-41ae-8e58-7eabbf382c8c",
        ios_sound: "pay",
        big_picture: "https://images.com/image.png",
        large_icon: "https://images.com/image.png",
        small_icon: "https://images.com/image.png",
        url: "https://opencrafts.io",
        buttons: [{ id: ticket_id, text: "View Ticket", icon: "" }],
      },
      meta: {
        event_type: "notification.requested",
        source_service_id: "io.opencrafts.verisafe",
        request_id: generateSheId(),
      },
    };

    sendNotification(notificationPayload);

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Ticket purchased successfully", req.path, 201, req.headers["user-agent"]);

    res.status(201).json({
      message: "Ticket purchased successfully",
      attendee,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ message: error.message });
  }
};
