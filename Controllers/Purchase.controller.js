import {getTicketByIdRepository , updateTicketRepository} from '../Repositories/Ticket.repository.js';
import {createAttendeeRepository} from '../Repositories/Attendee.repository.js'
export const purchaseTicketController = async (req , res) => {
  try {
    const user_id = req.user?.sub
    const ticket_quantity = req.body.ticket_quantity
    const ticket_id = req.body.ticket_id
  


    const ticket = await getTicketByIdRepository(ticket_id);

    // Check if quantity is available
    if(ticket_quantity > ticket.ticket_quantity){
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const event_id = ticket.event_id

    // Add user to attendees
   const attendee = await createAttendeeRepository({ticket_id , user_id , ticket_quantity , event_id});

  //   Update ticket quantity
   await updateTicketRepository(ticket_id , {ticket_quantity : ticket.ticket_quantity - ticket_quantity})



    res.status(201).json({
      message: "Ticket purchased successfully",
      attendee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}