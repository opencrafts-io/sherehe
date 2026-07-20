import { Ticket , TicketInstitution , Event } from '../Models/index.js';
import { getEventByIdRepository } from './Event.repository.js';
import { Sequelize , Op , literal } from "sequelize";
import { createTicketInstitutionRepository } from "./ticket_institution.repository.js";
import {createTicketInviteRepository} from "./ticket_invite.repository.js";
import crypto from "crypto";
export const createTicketRepository = async (data, options = {}) => {
  try {
    const ticket = await Ticket.create(data, {
  transaction: options.transaction
});
    let institutions = data.institutions;


    if (data.scope === "institution") {
      if (typeof data.institutions === "string") {
        institutions = JSON.parse(data.institutions);
      }
      for (const institution of institutions) {
        await createTicketInstitutionRepository({
          ticket_id: ticket.id,
          institution_id: institution
        }, { transaction: options.transaction });
      }
    } else if (data.scope === "private") {
      const token = crypto.randomBytes(32).toString("hex");
      await createTicketInviteRepository({
        ticket_id: ticket.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }, { transaction: options.transaction })
    }
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const getAllTicketsRepository = async () => {
  try {
    const tickets = await Ticket.findAll();
    return tickets;
  } catch (error) {
    throw error;
  }
};


export const getTicketByIdRepository = async (id) => {
  try {
    const ticket = await Ticket.findByPk(id);
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const getTicketbyEventIdRepository = async (eventId, institutionIds = [], user_id) => {
  try {
    // 1. Define visibility conditions
    const orConditions = [
      { scope: "public" } // Anyone sees public tickets
    ];

    if (institutionIds.length > 0) {
      orConditions.push({
        [Op.and]: [
          { scope: "institution" },
          { '$ticket_institutions.institution_id$': { [Op.in]: institutionIds } }
        ]
      });
    }


    const tickets = await Ticket.findAll({
      where: {
        event_id: eventId,
        [Op.or]: orConditions
      },
      include: [
        {
          model: TicketInstitution,
          as: "ticket_institutions",
          attributes: [],
          required: false,
          where: institutionIds.length > 0 ? {
            institution_id: { [Op.in]: institutionIds }
          } : undefined
        },
        {
          // We must include the Event to access its organizer_id
          model: Event,
          as: "event", 
          attributes: [], // We don't need the event data, just the join for the WHERE clause
          required: true  // A ticket must have an event
        }
      ],
      order: institutionIds.length > 0 ? [
        [
          literal(`
            CASE 
              WHEN "tickets"."scope" = 'institution' 
                   AND "ticket_institutions"."institution_id" IN (${institutionIds.map(id => Number(id)).join(',')})
              THEN 0
              ELSE 1
            END
          `),
          "ASC"
        ],
        ["created_at", "DESC"]
      ] : [["created_at", "DESC"]],
      subQuery: false,
      distinct: true
    });

    return tickets;
  } catch (error) {
    throw error;
  }
};

export const updateTicketRepository = async (id, data, options = {}) => {
  try {
    const ticket = await Ticket.findByPk(id, options);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    await ticket.update(data);
    return ticket;
  } catch (error) {
    throw error;
  }
};

export const deleteTicketRepository = async (id, organizer_id) => {
  try {
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return null;
    }

    // Get organizer is
    const event = await getEventByIdRepository(ticket.event_id);
    const organizer_id_event = event.organizer_id;

    if (organizer_id !== organizer_id_event) {
      throw new Error('Unauthorized: You cannot delete this ticket');
    }



    await ticket.destroy();
    return true; // indicate successful soft delete
  } catch (error) {
    throw error;
  }
};


export const getEventTicketSalesStatsRepository = async (eventId) => {
  const tickets = await Ticket.findAll({
    where: { event_id: eventId },

    attributes: [
      "id",
      "ticket_name",
      "ticket_price",
      "ticket_quantity", // remaining
      "scope",

      [
        Sequelize.literal(`(
          SELECT COALESCE(SUM(a.ticket_quantity), 0)
          FROM attendees a
          WHERE a.ticket_id = tickets.id
        )`),
        "tickets_sold"
      ]
    ],

    order: [["created_at", "ASC"]],
    raw: true
  });

  return tickets.map(ticket => ({
    ticket_id: ticket.id,
    ticket_name: ticket.ticket_name,
    ticket_price: ticket.ticket_price,
    tickets_sold: Number(ticket.tickets_sold),
    tickets_remaining: ticket.ticket_quantity,
    scope : ticket.scope
  }));
};