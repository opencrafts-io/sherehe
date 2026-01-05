import {createUserRepository  , getUserByIdRepository , updateUserRepository } from '../Repositories/User.repository.js';

export const createUserController = async (req , res) => {
  try {
    const user = await createUserRepository(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserByIdController = async (req , res) => {
  try {
    const user = await getUserByIdRepository(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserController = async (req , res) => {
  try {
    const user = await updateUserRepository(req.params.id , req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};