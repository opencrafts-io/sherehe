import { Transaction } from "../Models/index.js";

export const createTransactionRepository = async (data) => {
  try {
    const transaction = await Transaction.create(data);
    return transaction;
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    throw error;
  }
};

export const getAllTransactionsRepository = async () => {
  try {
    const transactions = await Transaction.findAll();
    return transactions;
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    throw error;
  }
};

export const getTransactionByUserIdTicketIdRepository = async (userId , ticketId) => {
  try {
    const transactions = await Transaction.findAll({ where: { user_id: userId , ticket_id: ticketId } });
    return transactions;
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    throw error;
  }
};

export const getTransactionByIdRepository = async (id) => {
  try {
    const transaction = await Transaction.findByPk(id);
    return transaction;
  } catch (error) {
    console.error('❌ Error getting transaction:', error);
    throw error;
  }
};

export const updateTransactionRepository = async (id, data) => {
  try {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    await transaction.update(data);
    return transaction;
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    throw error;
  }
};