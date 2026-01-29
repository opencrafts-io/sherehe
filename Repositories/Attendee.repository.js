import { Attendee , User , Ticket , Event } from "../Models/index.js";
import { Op , Sequelize } from "sequelize";

export const createAttendeeRepository = async (attendee) => {
  try {
    const newAttendee = await Attendee.create(attendee);
    return newAttendee;
  } catch (error) {
    throw error;
  }
};

export const getAllAttendeesByEventIdRepository = async (
  eventId,
  limitPlusOne,
  offset
) => {
  try {
    const attendees = await Attendee.findAll({
      where: {
        event_id: eventId,
        id: {
          [Op.in]: Sequelize.literal(`
            (
              SELECT DISTINCT ON (user_id) id
              FROM attendees
              WHERE event_id = '${eventId}'
              ORDER BY user_id, created_at DESC
            )
          `)
        }
      },

      order: [["created_at", "DESC"]],

      limit: limitPlusOne,
      offset,

      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "name", "phone"]
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

export const getAttendeeByEventAndIdRepository = async (
  eventId,
  attendeeId
) => {
  try {
    const attendee = await Attendee.findOne({
      where: {
        event_id: eventId,
        id: attendeeId
      },
      include: [
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "ticket_name", "ticket_price", "ticket_quantity"]
        },
        {
          model: Event,
          as: "event",
          attributes: ["id", "event_date"]
        }
      ]
    });

    return attendee;
  } catch (error) {
    throw error;
  }
};



export const getUserAttendedEventsRepository = async (
  userId,
  limitPlusOne,
  offset
) => {
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
        },
        {
          model: Ticket,
          as: "ticket",
          attributes: [
            "id",
            "ticket_name",
            "ticket_price",
          ],
        },
      ],
    });

    // ✅ Normalize event_genre to always be an array
    return attendees.map(attendee => {
      const json = attendee.toJSON();

      if (json.event) {
        json.event.event_genre = Array.isArray(json.event.event_genre)
          ? json.event.event_genre
          : JSON.parse(json.event.event_genre || "[]");
      }

      return json;
    });

  } catch (error) {
    throw error;
  }
};

export const searchAttendeesByEventNameTicketNameRepository = async (
  userId,
  searchQuery,
) => {
  const attendees = await Attendee.findAll({
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
      },
      {
        model: Ticket,
        as: "ticket",
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // ✅ Ensure event_genre is ALWAYS an array
  return attendees.map(attendee => {
    const json = attendee.toJSON();

    if (json.event) {
      json.event.event_genre = Array.isArray(json.event.event_genre)
        ? json.event.event_genre
        : JSON.parse(json.event.event_genre || "[]");
    }

    return json;
  });
};



export const getAllUserAttendedSpecificEventRepository = async (eventId , userId , limitPlusOne , offset) => {
  try {
    const attendees = await Attendee.findAll({
      where: {
        user_id: userId,
        event_id: eventId,
      },
      order: [["created_at", "DESC"]],
      limit: limitPlusOne,
      offset,
      include: [
        {
          model: Ticket,
          as: "ticket",
          attributes: [
            "id",
            "ticket_name",
            "ticket_price",
          ],
        },
      ],
    });
    return attendees;
  } catch (error) {
    throw error;
  }
}

export const getTotalAttendeesByEventIdRepository = async (eventId) => {
  try {
  const count = await Attendee.count({
    where: {
      event_id: eventId
    },
    distinct: true,
    col: "user_id"
  });

    return count;
  } catch (error) {
    throw error;
  }
};

export const getAttendeesByTicketIdRepository = async (ticketId) => {
  try {
    const attendees = await Attendee.findAll({
      where: {
        ticket_id: ticketId,
      },
    });
    return attendees;
  } catch (error) {
    throw error;
  }
}