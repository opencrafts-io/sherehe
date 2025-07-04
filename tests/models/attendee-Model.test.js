import { expect, it, jest } from '@jest/globals';

jest.unstable_mockModule('../../../sherehe/db.js', () => ({
    client: {
        query: jest.fn(),
    },
}));

const attendeeModel = await import('../../../sherehe/Model/attendee-Model.js');
const { client } = await import('../../../sherehe/db.js');

describe("Attendee Model", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add a new attendee using insert and return it", async () => {
        const mockAttendee = {
            id: 1,
            firstname: "Jane",
            middlename: "K.",
            lastname: "Doe",
            eventid: 1,
            ticketid: 5,
        };

        client.query.mockResolvedValueOnce({rows: [mockAttendee]});

        const result = await attendeeModel.insert({
            firstname: "Jane",
            middlename: "K.",
            lastname: "Doe",
            eventid: 2,
            ticketid: 5,
        });

        expect(client.query).toHaveBeenCalled();
        expect(result).toEqual(mockAttendee);
    });

    it("should use selectAll to return all attendees", async () => {
        const mockRows = [{ id: 1, firstname: "Jane" }];
        client.query.mockResolvedValueOnce({rows: mockRows});

        const result = await attendeeModel.selectAll();

        expect(client.query).toHaveBeenCalledWith("SELECT * FROM attendees");
        expect(result).toEqual(mockRows);
    });

    it("should use selectById to return attendee by Id", async () => {
        const mockAttendee = { id: 1, firstname: "John" };
        client.query.mockResolvedValueOnce({ rows: [mockAttendee] });

        const result = await attendeeModel.selectById(1);

        expect(client.query).toHaveBeenCalledWith("SELECT * FROM attendees WHERE id = $1", [1]);
        expect(result).toEqual(mockAttendee);
    });

    it("should use updateFull to update and return attendee", async () => {
        const mockUpdated = { id: 1, firstname: "Updated" };
        client.query.mockResolvedValueOnce({ rows: [mockUpdated] });

        const result = await attendeeModel.updateFull(1, {
            firstname: "Updated",
            middlename: null,
            lastname: "User",
            eventid: 2,
            ticketid: null,
        });

        expect(result).toEqual(mockUpdated);
    });

    it("should use updatePartial to update given fields and return updated attendee", async () => {
        const updated = { id: 1, firstname: "Partial" };
        client.query.mockResolvedValueOnce({ rows: [updated] });

        const result = await attendeeModel.updatePartial(1, { firstname: "Partial" });

        expect(result).toEqual(updated);
    });

    it("should use remove to delete attendee by Id", async () => {
       client.query.mockResolvedValueOnce({ rowCount: 1 });

        const result = await attendeeModel.remove(1);

        expect(result).toBe(true); 
    });

    it("should use remove and should return false if no rows were deleted", async () => {
        client.query.mockResolvedValueOnce({ rowCount: 0 });

        const result = await attendeeModel.remove(999);

        expect(result).toBe(false);
    });
});