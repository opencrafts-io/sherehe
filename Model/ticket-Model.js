import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { attendeeid, eventid, paymentcode } = params;

    const checkEvent = await pool.query("SELECT * FROM events WHERE id = $1", [eventid]);
    if (checkEvent.rows.length === 0) {
      return "Wrong Event ID"
    } else {
      const checkAttendee = await pool.query("SELECT * FROM attendees WHERE id = $1", [attendeeid]);
      if (checkAttendee.rows.length === 0) {
        return "Wrong Attendee ID"
      }
    }

    const query = `
      INSERT INTO tickets (attendeeid, eventid, paymentcode)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [attendeeid, eventid, paymentcode];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return "Error creating ticket"
    } else {
      return "Ticket created successfully"
    }
  } catch (error) {
    console.log(error)
    return "Internal server error"
  }
};

export const selectAllByAttendeeId = async (params) => {
  try {
    const { id, limitPlusOne, offset } = params;

    const query = "SELECT * FROM tickets WHERE attendeeid = $1 ORDER BY createdat DESC LIMIT $2 OFFSET $3";

    const values = [id, limitPlusOne, offset];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return "No tickets found"
    } else {
      return result.rows
    }
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};


export const selectByEventId = async (params) => {
  try {
    const { id, limitPlusOne, offset } = params;
    const query = "SELECT * FROM tickets WHERE eventid = $1 ORDER BY createdat DESC LIMIT $2 OFFSET $3";
    const values = [id, limitPlusOne, offset];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return "Ticket not found";
    } else {
      return result.rows
    }
  } catch (error) {
    console.error("Error in selectByEventId:", error);
    throw new Error("Internal server error");
  }
};

export const updateFull = async (id, { attendeeid, eventid, paymentcode }) => {
  try {
    const query = `
      UPDATE tickets
      SET attendeeid = $1, eventid = $2, paymentcode = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [attendeeid, eventid, paymentcode, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return "Ticket not found"
    } else {
      return "Ticket updated successfully"
    }
  } catch (error) {
    return "Internal server error"
  }
};

export const updatePartial = async (id, fields) => {
  if (!fields || typeof fields !== 'object') {
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
      throw new Error("No fields provided for update.");
    }

    const query = `
      UPDATE tickets SET ${columns.join(", ")} WHERE id = $${index} RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;

  } catch (error) {
    console.error("updatePartial error:", error);
    throw new Error("Internal server error");
  }
};


export const remove = async (params) => {
  try {
    const { id } = params
    const result = await pool.query("DELETE FROM tickets WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return "Ticket not found"
    } else {
      return "Ticket deleted successfully"
    }
  } catch (error) {
    return "Internal server error"
  }
};
