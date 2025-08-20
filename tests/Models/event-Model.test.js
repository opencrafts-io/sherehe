
import pool from "../../db.js";
import { insert, selectAll, selectById, update, remove, search } from "../../Model/event-Model.js";

// Mock pool
jest.mock("../../db.js", () => ({
  query: jest.fn(),
}));

describe("eventModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("insert", () => {
    it("should return success message on valid insert", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{}] });

      const result = await insert(
        "Test Event",
        "A test event.",
        "http://test.com",
        "18:00:00",
        "http://image.com",
        "http://poster.com",
        "http://banner.com",
        "2025-12-25",
        "Test Loc",
        "Test Org",
        "123",
        "Comedy"
      );

      expect(result).toBe("Event created successfully");
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO events"),
        [
          "Test Event",
          "2025-12-25",
          "Test Loc",
          "A test event.",
          "http://test.com",
          "18:00:00",
          "http://image.com",
          "http://poster.com",
          "http://banner.com",
          "Test Org",
          1,
          "123",
          "Comedy",
        ]
      );
    });

    it("should throw error when insert fails", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(
        insert(
          "Bad Event",
          "desc",
          "url",
          "time",
          "img",
          "poster",
          "banner",
          "2025-01-01",
          "loc",
          "org",
          "999",
          "genre"
        )
      ).rejects.toThrow("Error creating event");
    });
  });

  describe("selectAll", () => {
    it("should return events when found", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, organizer_id: 2, name: "Test Event" }],
      });

      const result = await selectAll({ limitPlusOne: 5, offset: 0 });
      expect(result).toEqual([{ id: "1", organizer_id: "2", name: "Test Event" }]);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [5, 0]
      );
    });

    it("should return 'No events found' when empty", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await selectAll({ limitPlusOne: 5, offset: 0 });
      expect(result).toBe("No events found");
    });
  });

  describe("selectById", () => {
    it("should return event if found", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, organizer_id: 2, name: "Test Event" }],
      });

      const result = await selectById({ id: 1 });
      expect(result).toEqual({ id: "1", organizer_id: "2", name: "Test Event" });
    });

    it("should return 'Event not found' if no rows", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await selectById({ id: 999 });
      expect(result).toBe("Event not found");
    });
  });

  describe("update", () => {
    it("should return updated event", async () => {
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, name: "Updated", date: "2025-12-25", location: "Loc" }],
      });

      const result = await update(1, { name: "Updated", date: "2025-12-25", location: "Loc" });
      expect(result).toEqual({ id: 1, name: "Updated", date: "2025-12-25", location: "Loc" });
    });

    it("should return 'Event not found' when no rows updated", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await update(1, { name: "X", date: "Y", location: "Z" });
      expect(result).toBe("Event not found");
    });
  });

  describe("remove", () => {
    it("should return success when event deleted", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await remove({ id: 1 });
      expect(result).toBe("Event deleted successfully");
    });

    it("should return not found when no rows deleted", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await remove({ id: 999 });
      expect(result).toBe("Event not found");
    });
  });

  describe("search", () => {
    it("should return matching events", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Comedy Night", organizer: "Test Org" }],
      });

      const result = await search({ searchQuery: "Comedy" });
      expect(result).toEqual([{ id: 1, name: "Comedy Night", organizer: "Test Org" }]);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("ILIKE"),
        ["%Comedy%"]
      );
    });

    it("should return empty array if no matches", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await search({ searchQuery: "Unknown" });
      expect(result).toEqual([]);
    });
  });
});
