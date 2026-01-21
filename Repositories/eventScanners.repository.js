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


export const deleteEventScannerRepository = async (id) => {
  try {
    const scanner = await EventScanner.findByPk(id);
    if (!scanner) {
      return null;
    }
    await scanner.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};
   