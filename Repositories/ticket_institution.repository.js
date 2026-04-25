import {TicketInstitution } from '../Models/index.js';
import { Op } from "sequelize";

export const createTicketInstitutionRepository = async (ticketInstitution , options={}) => {
  try {
    const newTicketInstitution = await TicketInstitution.create(ticketInstitution , options);
    return newTicketInstitution;
  } catch (error) {
    throw error;
  }
};


