import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

await client.connect();


export const insert = async (req, res) => {
  try {
    const { name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid } = req.body;
    const query = `INSERT INTO events (name, description, url, location , time , date , organizer , imageurl , numberofattendees , organizerid) VALUES ($1, $2, $3, $4)`;
    const values = [name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid];
    const result = await client.query(query, values);
    res.status(201).json({
      message: "Event created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Error creating event" });
  }
};

export const selectAll = async (req, res) => {
  try {
    const query = "SELECT * FROM events";
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
};

export const selectById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM events WHERE id = $1";
    const values = [id];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching event" });
  }
};

export const update = async (req, res) => {
  try {
    const { name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid } = req.body;
    const query = "UPDATE events SET name = $1, description = $2, url = $3, location = $4, time = $5, date = $6, organizer = $7, imageurl = $8, numberofattendees = $9, organizerid = $10 WHERE id = $11";
    const values = [ name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid];
    const result = await client.query(query, values);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Event not found" });
    }else{
      res.status(200).json({ message: "Event updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
};


export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM events WHERE id = $1";
    const values = [id];
    const result = await client.query(query, values);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(200).json({ message: "Event deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
};