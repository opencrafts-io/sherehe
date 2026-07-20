import { Event, EventInstitution , Institution } from '../Models/index.js';
import { Op, literal } from "sequelize";

export const createEventRepository = async (eventData, options = {}) => {
  try {
    const event = await Event.create(eventData, options);

    const { ...rest } = event.toJSON();

    const formatted = {
      ...rest,
      event_genre: Array.isArray(rest.event_genre)
        ? rest.event_genre
        : JSON.parse(rest.event_genre || '[]')
    };

    return formatted;
  } catch (error) {
    throw error;
  }
};

export const getAllEventsRepository = async (params, institutionIds = [], user_id) => {
  try {
    const { limitPlusOne = 20, offset = 0 } = params;

    // 1. Build the OR conditions for visibility
    const orConditions = [
      { scope: "public" } // Anyone can see public events
    ];

    // 2. If user has institutions, allow them to see institutional events for those IDs
    if (institutionIds.length > 0) {
      orConditions.push({
        [Op.and]: [
          { scope: "institution" },
          { '$event_institutions.institution_id$': { [Op.in]: institutionIds } }
        ]
      });
    }

    // 3. Allow the organizer to see their own private events
    if (user_id) {
      orConditions.push({
        [Op.and]: [
          { scope: "private" },
          { organizer_id: user_id }
        ]
      });
    }

    const whereCondition = { [Op.or]: orConditions };

    // Build order array (keeping your existing logic for prioritizing institutions)
    let orderArray = [["created_at", "DESC"]];
    
    if (institutionIds.length > 0) {
      const institutionIdList = institutionIds.map(id => Number(id)).join(',');
      orderArray = [
        [
          literal(`
            CASE 
              WHEN "events"."scope" = 'institution' 
                   AND "event_institutions"."institution_id" IN (${institutionIdList})
              THEN 0
              ELSE 1
            END
          `),
          "ASC"
        ],
        ["created_at", "DESC"]
      ];
    }

    const events = await Event.findAll({
      where: whereCondition,
      include: [
        {
          model: EventInstitution,
          as: "event_institutions",
          attributes: ["institution_id"],
          required: false, // Left Join is necessary here so we don't exclude public/private events
          where: institutionIds.length > 0 ? {
            institution_id: { [Op.in]: institutionIds }
          } : undefined
        }
      ],
      order: orderArray,
      limit: limitPlusOne,
      offset,
      subQuery: false,
      distinct: true
    });

const formattedEvents = events.map(event => {
  const json = event.toJSON();

  const result = {
    ...json,
    event_genre: Array.isArray(json.event_genre)
      ? json.event_genre
      : JSON.parse(json.event_genre || "[]")
  };

  // Remove raw join table data
  delete result.event_institutions;

  // Only add institutions for institution-scoped events
  if (json.scope === "institution") {
    result.institutions = (json.event_institutions || []).map(inst =>
      String(inst.institution_id)
    );
  }

  return result;
});

    return formattedEvents;

  } catch (error) {
    throw error;
  }
};


export const getEventByIdRepository = async (eventId) => {
  try {
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: EventInstitution,
          attributes: ["institution_id"],
          required: false,
          include: [
            {
              model: Institution,
              as: "institution",
              attributes: ["institution_id", "name"],
            },
          ],
        },
      ],
    });

    if (!event) return null;

    const json = event.toJSON();

    const formattedEvent = {
      ...json,
      event_genre: Array.isArray(json.event_genre)
        ? json.event_genre
        : JSON.parse(json.event_genre || "[]"),
    };

    // Remove the join table from the response
    delete formattedEvent.event_institutions;

    // Only include institutions for institution-scoped events
    if (json.scope === "institution") {
      formattedEvent.institutions = (json.event_institutions || []).map(
        ({ institution }) => ({
          institution_id: institution.institution_id,
          name: institution.name,
        })
      );
    }

    return formattedEvent;
  } catch (error) {
    throw error;
  }
};

export const updateEventRepository = async (eventId, eventData, userId) => {
  try {
    const event = await Event.findByPk(eventId);

    if (!event) {
      return { status: "not_found" };
    }

    // Optional: Only allow the event creator/organizer to update
    if (event.organizer_id !== userId) {
      return { status: "unauthorized" };
    }

    await event.update(eventData);

    const formattedEvent = {
      ...event.toJSON(),
      event_genre: Array.isArray(event.event_genre)
        ? event.event_genre
        : JSON.parse(event.event_genre || '[]'),
    };

    return { status: "success", event: formattedEvent };
  } catch (error) {
    throw error;
  }
};


export const deleteEventRepository = async (eventId, userId) => {
  try {
    // Find the event by ID
    const event = await Event.findByPk(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.delete_tag === true) {
      throw new Error("Event already deleted");
    }


    // Optional: Check if the user is authorized to delete the event
    if (event.organizer_id !== userId) {
      throw new Error("Unauthorized: You cannot delete this event");
    }

    // Soft delete by updating the delete_tag flag
    await event.destroy()

    return { message: "Event deleted successfully" };
  } catch (error) {
    throw error;
  }
};



export const searchEventRepository = async (searchQuery) => {
  try {
    const events = await Event.findAll({
      where: {
        [Op.or]: [
          { event_name: { [Op.iLike]: `%${searchQuery}%` } },
          { event_description: { [Op.iLike]: `%${searchQuery}%` } },
          { event_location: { [Op.iLike]: `%${searchQuery}%` } },
        ],
      },
      order: [["created_at", "DESC"]],
    });
    const formattedEvents = events.map(event => ({
      ...event.toJSON(),
      event_genre: Array.isArray(event.event_genre)
        ? event.event_genre
        : JSON.parse(event.event_genre || '[]')
    }));
    return formattedEvents;
  } catch (error) {
    throw error;
  }
};


export const getEventbyOrganizerIdRepository = async (organizerId) => {
  try {
    const events = await Event.findAll({
      where: { organizer_id: organizerId },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: EventInstitution,
          attributes: ["institution_id"],
          required: false,
          include: [
            {
              model: Institution,
              as: "institution",
              attributes: ["institution_id", "name"],
            },
          ],
        },
      ],
    });

    const formattedEvents = events.map((event) => {
      const json = event.toJSON();

      const formattedEvent = {
        ...json,
        event_genre: Array.isArray(json.event_genre)
          ? json.event_genre
          : JSON.parse(json.event_genre || "[]"),
      };

      // Remove the join table from the response
      delete formattedEvent.event_institutions;

      // Only include institutions for institution-scoped events
      if (json.scope === "institution") {
        formattedEvent.institutions = (json.event_institutions || []).map(
          ({ institution }) => ({
            institution_id: institution.institution_id,
            name: institution.name,
          })
        );
      }

      return formattedEvent;
    });

    return formattedEvents;
  } catch (error) {
    throw error;
  }
};


export const getEventByTagsRepository = async (tags) => {
  try {
    const events = await Event.findAll({
      where: {
        event_genre: {
          [Op.overlap]: tags
        }
      },
      order: [["created_at", "DESC"]],
    });

    return events.map(event => ({
      ...event.toJSON(),
      event_genre: event.event_genre ?? []
    }));
  } catch (error) {
    throw error;
  }
};