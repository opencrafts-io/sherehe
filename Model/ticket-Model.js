import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { attendee_id, event_id, payment_code } = params;

    const checkEvent = await pool.query("SELECT * FROM events WHERE id = $1", [event_id]);
    if (checkEvent.rows.length === 0) {
      throw new Error("Wrong Event ID");
    }

    const checkAttendee = await pool.query("SELECT * FROM attendees WHERE id = $1", [attendee_id]);
    if (checkAttendee.rows.length === 0) {
      throw new Error("Wrong Attendee ID"); 
    }

    const query = `
      INSERT INTO tickets (attendee_id, event_id, payment_code)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [attendee_id, event_id, payment_code];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Error creating ticket");
    } else {
      return "Ticket created successfully";
    }
  } catch (error) {
    throw error;
  }
};

export const selectAllByAttendeeId = async (params) => {
  try {
    const { id, limitPlusOne, offset } = params;
    const query = "SELECT * FROM tickets WHERE attendee_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    const values = [id, limitPlusOne, offset];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("No tickets found");
    } else {
      return result.rows;
    }
  } catch (error) {
    throw error;
  }
};

export const selectByEventId = async (params) => {
  try {
    const { id, limitPlusOne, offset } = params;
    const query = "SELECT * FROM tickets WHERE event_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    const values = [id, limitPlusOne, offset];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Ticket not found");
    } else {
      return result.rows;
    }
  } catch (error) {
    throw error;
  }
};

export const updateFull = async (id, { attendeeid, eventid, paymentcode }) => {
  try {
    const query = `
      UPDATE tickets
      SET attendee_id = $1, event_id = $2, payment_code = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [attendeeid, eventid, paymentcode, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Ticket not found");
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
      UPDATE tickets
      SET ${columns.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Ticket not found");
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
    const query = "DELETE FROM tickets WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new Error("Ticket not found");
    } else {
      return "Ticket deleted successfully";
    }
  } catch (error) {
    throw error;
  }
};