import {UserInstitution } from '../Models/index.js';
import { Op } from "sequelize";

export const createUserInstitutionRepository = async (userInstitution, options = {}) => {
  try {

    const existing = await UserInstitution.unscoped().findOne({
      where: {
        user_id: userInstitution.user_id,
        institution_id: userInstitution.institution_id
      },
      paranoid: false,
      transaction: options.transaction
    });
    
    if (existing) {
      if (existing.deleted_at !== null) {
        await existing.restore({ transaction: options.transaction });
        return existing;
      }
      
      return existing;
    }
    
    const newuserInstitution = await UserInstitution.create(userInstitution, options);
    return newuserInstitution;
  } catch (error) {
    throw error;
  }
};

export const deleteUserInstitutionRepository = async (user_id, institution_id) => {
  try {
    const userInstitution = await UserInstitution.findOne({ 
      where: { 
        user_id: user_id, 
        institution_id: institution_id 
      } 
    });
    
    if (!userInstitution) {
      throw new Error("userInstitution not found");
    }
    
    await userInstitution.destroy();
    return { message: "userInstitution deleted successfully" };
  } catch (error) {
    throw error;
  }
};


export const getAllUserInstitutionRepository = async (user_id) => {
  try {
    const userInstitutions = await UserInstitution.findAll({ 
      where: { user_id: user_id },
      attributes: ['institution_id']
    });
    
    // Extract just the institution IDs
    const institutionIds = userInstitutions.map(ui => ui.institution_id);
    
    return {
      institutions: userInstitutions,
      institutionIds: institutionIds
    };
  } catch (error) {
    throw error;
  }
};