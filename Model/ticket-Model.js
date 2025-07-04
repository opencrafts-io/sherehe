import { client } from "../db.js";

export const insert = async ({ attendeeid, eventid, paymentcode }) => {
  try {
    const query = `
      INSERT INTO ticket (attendeeid, eventid, paymentcode)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [attendeeid, eventid, paymentcode];
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const selectAll = async () => {
  try {
    const result = await client.query("SELECT * FROM ticket");
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const selectById = async (id) => {
  try {
    const result = await client.query("SELECT * FROM ticket WHERE id = $1", [id]);
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
    const result = await client.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const updatePartial = async (id, fields) => {
  if (!fields || typeof fields !== "object") {
    throw new Error("No fields provided or invalid update data.");
  }

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

    const result = await client.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await client.query("DELETE FROM ticket WHERE id = $1", [id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
