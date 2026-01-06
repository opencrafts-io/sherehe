import { Attendee , User , Ticket , Event } from "../Models/index.js";
import { Op } from "sequelize";

export const createAttendeeRepository = async (attendee) => {
  try {
    const newAttendee = await Attendee.create(attendee);
    return newAttendee;
  } catch (error) {
    throw error;
  }
};

export const getAllAttendeesByEventIdRepository = async (eventId , limitPlusOne, offset) => {
  try {
    const attendees = await Attendee.findAll({
      where: { event_id: eventId },
      order: [["created_at", "DESC"]],
       limit: limitPlusOne, offset: offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "name", "phone"] // choose fields you want
        }
      ]
    });

    return attendees;
  } catch (error) {
    throw error;
  }
};



export const getAllAttendeesByUserIdRepository = async (userId) => {
  try {
    const attendees = await Attendee.findAll({ where: { user_id: userId } });
    return attendees;
  } catch (error) {
    throw error;
  }
}

export const deleteAttendeeRepository = async (attendeeId) => {
  try {
    const attendee = await Attendee.findByPk(attendeeId);

    if (!attendee) {
      return null; // return null so controller can handle 404
    }

    await attendee.destroy()
    return attendee;
  } catch (error) {
    throw error;
  }
};


export const updateAttendeeRepository = async (attendeeId, attendeeData) => {
  try {
    const attendee = await Attendee.findByPk(attendeeId);
    if (!attendee) {
      throw new Error('Attendee not found');
    }
    await attendee.update(attendeeData);
    return attendee;
  } catch (error) {
    throw error;
  }
};

export const getAttendeebyEventIdUserIdRepository = async (eventId, userId) => {
  try {
    const attendee = await Attendee.findOne({ where: { event_id: eventId, user_id: userId } });
    return attendee;
  } catch (error) {
    throw error;
  }
}

export const getAttendeeByIdRepository = async (id) => {
  try {
    const attendee = await Attendee.findByPk(id);
    return attendee;
  } catch (error) {
    throw error;
  }
}

export const getAttendeesByUserIdRepository = async (eventId, userId) => {
  try {
    const attendees = await Attendee.findAll({ where: { event_id: eventId, user_id: userId } ,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "ticket_name", "ticket_price", "ticket_quantity"]
        },
        {
          model: Event,
          as: "event",
          attributes: [
            "id",
            "event_date",
          ],
        },
      ] });
    return attendees;
  } catch (error) {
    throw error;
  }
}


export const getUserAttendedEventsRepository = async (userId , limitPlusOne, offset) => {
  try {
    const attendees = await Attendee.findAll({
      where: {
        user_id: userId,
      },

      order: [["created_at", "DESC"]],
      limit: limitPlusOne,
      offset,

      include: [
        {
          model: Event,
          as: "event",
          attributes: [
            "id",
            "event_name",
            "event_date",
            "event_location",
            "event_description",
            "event_card_image",
            "event_poster_image",
            "event_banner_image",
            "event_genre",
          ],
        },
      ],
    });

    return attendees;
  } catch (error) {
    throw error;
  }
}
export const searchAttendeesByEventNameTicketNameRepository = async (
  userId,
  searchQuery,
) => {
  return Attendee.findAll({
    where: {
      user_id: userId,
      [Op.or]: [
        { "$event.event_name$": { [Op.iLike]: `%${searchQuery}%` } },
        { "$ticket.ticket_name$": { [Op.iLike]: `%${searchQuery}%` } },
      ],
    },
    include: [
      {
        model: Event,
        as: "event",
        attributes: ["id", "event_name"],
      },
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id", "ticket_name"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};