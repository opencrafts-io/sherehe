
import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { firstname, middlename, lastname, eventid } = params;
    const query = `
        INSERT INTO attendees (firstname, middlename, lastname, eventid)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [firstname, middlename || null, lastname, eventid];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error("Error creating attendee");
    } else {
      return "Attendee created successfully";
    }
  } catch (error) {
    throw error;
  }
};

export const selectAll = async (params) => {
  try {
    const { id, limitPlusOne, offset } = params;
    const query = "SELECT * FROM attendees WHERE eventid = $1 ORDER BY createdat DESC LIMIT $2 OFFSET $3";
    const values = [id, limitPlusOne, offset];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("No attendees found");
    } else {
      return result.rows;
    }
  } catch (error) {
    throw error;
  }
};

export const selectById = async (params) => {
  try {
    const { id } = params;
    const query = "SELECT * FROM attendees WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Attendee not found");
    } else {
      return result.rows[0];
    }
  } catch (error) {
    throw error;
  }
};

export const updateFull = async (id, { firstname, middlename, lastname, eventid }) => {
  try {
    const query = `
            UPDATE attendees
            SET firstname = $1, middlename = $2, lastname = $3, eventid = $4
            WHERE id = $5
            RETURNING *
        `;
    const values = [firstname, middlename || null, lastname, eventid, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Attendee not found");
    } else {
      return result.rows[0];
    }
  } catch (error) {
    throw error;
  }
};

export const updatePartial = async (id, fields) => {
  if (!fields || typeof fields !== 'object' || Object.keys(fields).length === 0) {
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

    const query = `
            UPDATE attendees
            SET ${columns.join(", ")}
            WHERE id = $${index}
            RETURNING *
        `;

    values.push(id);

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Attendee not found");
    } else {
      return result.rows[0];
    }
  } catch (error) {
    throw error;
  }
};

export const remove = async (params) => {
  try {
    const { id } = params;
    const query = "DELETE FROM attendees WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new Error("Attendee not found");
    } else {
      return "Attendee deleted successfully";
    }
  } catch (error) {
    throw error;
  }
};