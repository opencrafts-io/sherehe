import {User} from "../Models/index.js";


export const createUserRepository = async (data) => {
  try {
    const user = await User.create(data);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export const getUserByIdRepository = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    throw error;
  }
}

export const updateUserRepository = async (id, data) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    await user.update(data);
    return user;
  } catch (error) {
    throw error;
  }
}