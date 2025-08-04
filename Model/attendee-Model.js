
import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { first_name, middle_name, last_name, event_id } = params;
    const query = `
        INSERT INTO attendees (first_name, middle_name, last_name, event_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [first_name, middle_name || null, last_name, event_id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error("Error creating attendee");
    } else {
      const updateNumberofAttendee = await pool.query("UPDATE events SET number_of_attendees = number_of_attendees + 1 WHERE id = $1", [event_id]);
      return "Attendee created successfully";
    }
  } catch (error) {
    throw error;
  }
};

export const selectAll = async (params) => {
  try {
    const { id, limitPlusOne, offset } = params;
    const query = "SELECT * FROM attendees WHERE event_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
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

export const updateFull = async (id, { first_name, middle_name, last_name, event_id }) => {
  try {
    const query = `
            UPDATE attendees
            SET first_name = $1, middle_name = $2, last_name = $3, event_id = $4
            WHERE id = $5
            RETURNING *
        `;
    const values = [first_name, middle_name || null, last_name, event_id, id];
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
      const reducenumberofAttendee = await pool.query("UPDATE events SET number_of_attendees = number_of_attendees - 1 WHERE id = (SELECT event_id FROM attendees WHERE id = $1)", [id]);
      return "Attendee deleted successfully";
    }
  } catch (error) {
    throw error;
  }
};