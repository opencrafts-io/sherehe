import pool from "../db.js";

export const insert = async (params) => {
  try {
    const { name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid } = params;
    const query = `INSERT INTO events (name, description, url, location , time , date , organizer , imageurl , numberofattendees , organizerid) VALUES ($1, $2, $3, $4 , $5 , $6 , $7 , $8 , $9 , $10) RETURNING *`;
    const values = [name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid];
    const result = await pool.query(query, values);
    if(result.rowCount === 0){
      return "Error creating event"
    }else{
      return "Event created successfully"
    }
  } catch (error) {
    console.log(error)
    return "Internal server error"
  }
};

export const selectAll = async () => {
  try {
    const query = "SELECT * FROM events";
    const result = await pool.query(query);
    if(result.rows.length === 0){
      return "No events found"
    }else{
      return result.rows
    }
  } catch (error) {
    return "Internal server error"
  }
};

export const selectById = async (params) => {
  try {
    const { id } = params;
    const query = "SELECT * FROM events WHERE id = $1";
    const values = [id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
     return "Event not found"
    } else {
      return result.rows
    }
  } catch (error) {
    return "Internal server error"
  }
};

export const update = async (params) => {
  try {
    const { name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid } = params;
    const query = "UPDATE events SET name = $1, description = $2, url = $3, location = $4, time = $5, date = $6, organizer = $7, imageurl = $8, numberofattendees = $9, organizerid = $10 WHERE id = $11";
    const values = [ name , description , url , location , time , date , organizer , imageurl , numberofattendees , organizerid];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return "Event not found"
    }else{
      return "Event updated successfully"
    }
  } catch (error) {
    return "Internal server error"
  }
};


export const remove = async (params) => {
  try {
    const { id } = params;
    const query = "DELETE FROM events WHERE id = $1";
    const values = [id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return "Event not found"
    } else {
      return "Event deleted successfully"
    }
  } catch (error) {
    return "Internal server error"
  }
};