import {Institution} from '../Models/index.js'

export const createInstitutionRepository = async (data , options={}) => {
  try {
    const institution = await Institution.create(data , options);

    return institution;
  } catch (err) {
    throw err;
  }
};

export const updateInstitutionRepository = async (id, data) => {
  try {
    const institution = await Institution.findByPk(id);
    if (!institution) {
      throw new Error("Institution not found");
    }
    await institution.update(data);
    return institution;
  } catch (err) {
    throw err;
  }
};
export const deleteInstitutionRepository = async (id) => {
  try {
    const institution = await Institution.findByPk(id);
    if (!institution) {
      throw new Error("Institution not found");
    }
    await institution.destroy();
    return { message: "Institution deleted successfully" };
  } catch (err) {
    throw err;
  }
};
