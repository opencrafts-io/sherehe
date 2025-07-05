import pkg from 'pg';
const { Pool } = pkg;
import pool from '../../db.js';

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mPool),
  };
});

describe('Database Pool', () => {
  it('should create a Pool with env config', () => {
    expect(Pool).toHaveBeenCalledWith({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});