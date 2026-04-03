import {EventInstitution } from '../Models/index.js';
import { Op } from "sequelize";

export const createEventInstitutionRepository = async (eventInstitution) => {
  try {
    const newEventInstitution = await EventInstitution.create(eventInstitution);
    return newEventInstitution;
  } catch (error) {
    throw error;
  }
};


