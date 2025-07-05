import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { attendeeid, eventid, paymentcode } = params;
    const query = `
      INSERT INTO ticket (attendeeid, eventid, paymentcode)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [attendeeid, eventid, paymentcode];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const selectAll = async () => {
  try {
    const result = await pool.query("SELECT * FROM ticket");
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const selectById = async (params) => {
  try {
    const { id } = params;
    const result = await pool.query("SELECT * FROM ticket WHERE id = $1", [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const updateFull = async (id, { attendeeid, eventid, paymentcode }) => {
  try {
    const query = `
      UPDATE ticket
      SET attendeeid = $1, eventid = $2, paymentcode = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [attendeeid, eventid, paymentcode, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const updatePartial = async (params) => {
  if (!fields || typeof fields !== "object") {
    throw new Error("No fields provided or invalid update data.");
  }

  const { id, fields } = params;

  try {
    const columns = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(fields)) {
      columns.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    if (columns.length === 0) {
      throw new Error("No fields to update.");
    }

    const query = `
      UPDATE ticket
      SET ${columns.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const remove = async () => {
  try {
    const {id} = params
    const result = await pool.query("DELETE FROM ticket WHERE id = $1", [id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
