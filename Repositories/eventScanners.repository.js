import {  EventScanner } from '../Models/index.js';
import { Op } from "sequelize";

export const createEventScannerRepository = async (eventScanner) =>{
    try {
    const neweventScanner = await EventScanner.create(eventScanner);
    return neweventScanner;
  } catch (error) {
    throw error;
  }
}

export const getEventScannerByUserIdEventIdRepository = async (userId, eventId) => {
  try {
    const scanner = await EventScanner.findOne({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    if (!scanner) return null;

    return scanner;
  } catch (error) {
    throw error;
  }
};

export const getEventScannerByEventIdRepository = async (eventId) => {
  try {
    const scanner = await EventScanner.findAll({
      where: {
        event_id: eventId,
      },
    });

    if (!scanner) return null;

    return scanner;
  } catch (error) {
    throw error;
  }
};


export const deleteEventScannerRepository = async (
  scannerId,
  organizer_id
) => {
  const scanner = await EventScanner.findByPk(scannerId);

  if (!scanner) {
    return null;
  }

  if (scanner.granted_by !== organizer_id) {
    throw new Error("Unauthorized: You cannot delete this scanner");
  }

  await scanner.destroy();
  return scanner;
};
   