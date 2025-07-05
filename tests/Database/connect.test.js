import pool from '../../db.js';

describe('Database connection integration test', () => {
  it('should successfully query the database', async () => {
    const res = await pool.query('SELECT NOW()');
    console.log('DB connected:', res.rows);
    expect(res).toHaveProperty('rows');
    expect(res.rows.length).toBe(1);
  });
});

afterAll(async () => {
  await pool.end();
});
