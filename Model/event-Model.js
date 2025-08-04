import pool from "../db.js";

export const insert = async (name, description, url , time , image_url , date, location , organizer   , organizer_id, genre ) => {
  try {
    const number_of_attendees = 0
    const query = `
      INSERT INTO events (name, date, location , description, url , time , image_url , organizer , number_of_attendees  , organizer_id, genre)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [name, date, location , description, url , time , image_url , organizer , number_of_attendees  , organizer_id, genre]; ;
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
    const query = "SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2";
    const values = [limitPlusOne, offset];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("No events found"); 
    } else {
      // Convert `id` and `organization_id` to strings here
      const formattedRows = result.rows.map(row => ({
        ...row,
        id: row.id?.toString() ?? null,
        organizer_id: row.organizer_id?.toString() ?? null,
      }));

      return formattedRows;
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
      const row = result.rows[0];

      // Convert id and organization_id to strings
      const formattedRow = {
        ...row,
        id: row.id?.toString() ?? null,
        organizer_id: row.organizer_id?.toString() ?? null,
      };

      return formattedRow;
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