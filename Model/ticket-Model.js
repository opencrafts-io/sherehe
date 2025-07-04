import { client } from "../db.js";

export const insert = async (req, res) => {
  try {
    const { attendeeId, eventId, paymentCode } = req.body;

    const query = `
      INSERT INTO ticket (attendeeId, eventId, paymentCode)
      VALUES ($1, $2, $3)
    `;

    const values = [attendeeId, eventId, paymentCode];
    const result = await client.query(query, values);

    res.status(201).json({message: "Ticket created successfully",});
  } catch (error) {
    res.status(500).json({ error: "Error creating ticket" });
  }
};

export const selectAll = async (req, res) => {
  try {
    const query = "SELECT * FROM ticket";
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({message: "Error fetching tickets"});
  }
};

export const selectById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM ticket WHERE id = $1";
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching ticket" });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeId, eventId, paymentCode } = req.body;

    const query = `
      UPDATE ticket
      SET attendeeId = $1, eventId = $2, paymentCode = $3
      WHERE id = $4
    `;

    const values = [attendeeId, eventId, paymentCode, id];
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating ticket" });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query("DELETE FROM ticket WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting ticket" });
  }
};
