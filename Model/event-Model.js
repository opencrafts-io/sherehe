import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { name, description, url , time , imageurl , date, location , organizer , numberofattendees , organizerid, genre  } = params;
    const query = `
      INSERT INTO events (name, date, location , description, url , time , imageurl , organizer , numberofattendees , organizerid, genre)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [name, date, location , description, url , time , imageurl , organizer , numberofattendees , organizerid, genre]; ;
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error("Error creating event");
    } else {
      return "Event created successfully";
    }
  } catch (error) {
    throw error;
  }
};

export const selectAll = async (params) => {
  try {
    const { limitPlusOne, offset } = params;
    const query = "SELECT * FROM events ORDER BY createdat DESC LIMIT $1 OFFSET $2";
    const values = [limitPlusOne, offset];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("No events found");
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
    const query = "SELECT * FROM events WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Event not found");
    } else {
      return result.rows[0];
    }
  } catch (error) {
    throw error;
  }
};

export const update = async (id, { name, date, location }) => {
  try {
    const query = `
      UPDATE events
      SET name = $1, date = $2, location = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, date, location, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error("Event not found");
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
    const query = "DELETE FROM events WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new Error("Event not found");
    } else {
      return "Event deleted successfully";
    }
  } catch (error) {
    throw error;
  }
};