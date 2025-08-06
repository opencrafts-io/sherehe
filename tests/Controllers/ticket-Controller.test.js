import { createTicket } from '../../Controllers/ticket-Controller.js';
import * as ticketModel from '../../Model/ticket-Model.js';
import { logs } from '../../utils/logs.js';

jest.mock('../../Model/ticket-Model.js');
jest.mock('../../utils/logs.js');

describe('createTicket controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        eventId: 1,
        attendeeId: 1,
        price: 100,
      },
      ip: '127.0.0.1',
      method: 'POST',
      url: '/tickets',
      headers: { 'user-agent': 'JestTest' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 201 if ticket is created successfully', async () => {
    ticketModel.insert.mockResolvedValue('Ticket created successfully');

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Ticket created successfully' });
  });

  it('should return 404 if required fields are missing', async () => {
    ticketModel.insert.mockResolvedValue('Error creating ticket');

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  it('should return 404 if wrong event ID is provided', async () => {
    ticketModel.insert.mockResolvedValue('Wrong Event ID');

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Wrong Event ID' });
  });

  it('should return 404 if wrong attendee ID is provided', async () => {
    ticketModel.insert.mockResolvedValue('Wrong Attendee ID');

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Wrong Attendee ID' });
  });

  it('should return 500 on unexpected error', async () => {
    ticketModel.insert.mockRejectedValue(new Error('DB failure'));

    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error creating ticket' });
  });

  it('should always call logs()', async () => {
    ticketModel.insert.mockResolvedValue('Ticket created successfully');

    await createTicket(req, res);

    expect(logs).toHaveBeenCalled();
  });
});
