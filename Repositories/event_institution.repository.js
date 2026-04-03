import {EventInstitution } from '../Models/index.js';
import { Op } from "sequelize";

export const createEventInstitutionRepository = async (eventInstitution , options={}) => {
  try {
    const newEventInstitution = await EventInstitution.create(eventInstitution , options);
    return newEventInstitution;
  } catch (error) {
    throw error;
  }
};


