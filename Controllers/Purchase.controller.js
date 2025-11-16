import { getTicketByIdRepository, updateTicketRepository } from '../Repositories/Ticket.repository.js';
import { createAttendeeRepository } from '../Repositories/Attendee.repository.js';
import { sendNotification } from '../Utils/Notification.js';
import { getEventByIdRepository } from '../Repositories/Event.repository.js';
import { randomUUID } from 'crypto'; // For generating unique request_id


const generateSheId = () => `she_${randomUUID()}`;

export const purchaseTicketController = async (req, res) => {
  try {
    const user_id = req.user?.sub;
    const ticket_quantity = req.body.ticket_quantity;
    const ticket_id = req.body.ticket_id;


    const ticket = await getTicketByIdRepository(ticket_id);


    if (ticket_quantity > ticket.ticket_quantity) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const event_id = ticket.event_id;

    const event = await getEventByIdRepository(event_id);


    const attendee = await createAttendeeRepository({ ticket_id, user_id, ticket_quantity, event_id });


    await updateTicketRepository(ticket_id, { ticket_quantity: ticket.ticket_quantity - ticket_quantity });

    const eventDate = new Date(event.event_date).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });


    const contents = {
      en: `Hello,\n\nYou have successfully purchased ${ticket_quantity} ticket(s) for "${event.event_name}" scheduled on ${eventDate}.\n\nThank you for your purchase!`
    };

    // Send Notification
    const notificationPayload = {
      notification: {
        app_id: "88ca0bb7-c0d7-4e36-b9e6-ea0e29213593",
        headings: { en: "Ticket Purchase Successful!" },
        contents,
        target_user_id: user_id, // set the user who bought the ticket
        include_external_user_ids: [], // can add other related users if needed
        subtitle: { en: "Thank you for your purchase" },
        android_channel_id: "60023d0b-dcd4-41ae-8e58-7eabbf382c8c",
        ios_sound: "pay",
        big_picture: "https://images.com/image.png",
        large_icon: "https://images.com/image.png",
        small_icon: "https://images.com/image.png",
        url: "https://opencrafts.io",
        buttons: [
          { id: ticket_id, text: "View Ticket", icon: "" }
        ]
      },
      meta: {
        event_type: "notification.requested",
        source_service_id: "io.opencrafts.verisafe",
        request_id: generateSheId()
      }
    };

    sendNotification(notificationPayload);

    res.status(201).json({
      message: "Ticket purchased successfully",
      attendee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
