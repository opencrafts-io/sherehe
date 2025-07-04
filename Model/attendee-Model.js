import { client } from "../db.js";

export const insert = async ({ firstname, middlename, lastname, eventid, ticketid }) => {
    const query = `
        INSERT INTO attendees (firstname, middlename, lastname, eventid, ticketid)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [firstname, middlename || null, lastname, eventid, ticketid || null];

    const result = await client.query(query, values);
    return result.rows[0]; 
};


export const selectAll = async () => {
  try {
    const query = "SELECT * FROM attendees";
    const result = await client.query(query);
    return result.rows; 
  } catch (error) {
    throw error;
  }
};

export const selectById = async (id) => {
  try {
    const query = "SELECT * FROM attendees WHERE id = $1";
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return null; 
    }

    return result.rows[0]; 
  } catch (error) {
    throw error;
  }
};

export const updateFull = async (id, { firstname, middlename, lastname, eventid, ticketid }) => {
    try {
        const query = `
            UPDATE attendees
            SET firstname = $1, middlename = $2, lastname = $3, eventid = $4, ticketid = $5
            WHERE id = $6
            RETURNING *
        `;
        const values = [firstname, middlename || null, lastname, eventid, ticketid || null, id];
        const result = await client.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
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
        UPDATE attendees
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
    const query = "DELETE FROM attendees WHERE id = $1";
    const result = await client.query(query, [id]);

    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
