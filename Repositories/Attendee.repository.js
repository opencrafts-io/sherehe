import { Attendee } from "../Models/index.js";

export const createAttendeeRepository = async (attendee) => {
  try {
    const newAttendee = await Attendee.create(attendee);
    return newAttendee;
  } catch (error) {
    throw error;
  }
};

export const getAllAttendeesByEventIdRepository = async (eventId) => {
  try {
    const attendees = await Attendee.findAll({
      where: { event_id: eventId , delete_tag: false},
      order: [["createdAt", "DESC"]],
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

    await attendee.update({ delete_tag: true });
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