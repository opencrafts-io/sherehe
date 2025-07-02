import { insert , selectAll , selectById , update , remove } from "../Model/event-Model.js";
export const createEvent = async (req, res) => {
  try {
    const result = await insert(req, res);
  } catch (error) {
    
  }
}

