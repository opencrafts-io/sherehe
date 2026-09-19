import {
  Event,
  EventInstitution,
  Institution,
  Attendee
} from '../Models/index.js';

import {
  Op,
  literal
} from 'sequelize';


// ============================================================
// Helper
// ============================================================

const attendeeCountLiteral = () => literal(`(
  SELECT COALESCE(SUM("ticket_quantity"), 0)
  FROM "attendees"
  WHERE "attendees"."event_id" = "events"."id"
)`);


// ============================================================
// Create Event
// ============================================================

export const createEventRepository = async (eventData, options = {}) => {
  try {
    const event = await Event.create(eventData, options);

    const rest = event.toJSON();

    const formatted = {
      ...rest,

      // Always calculate attendee count from registrations
      attendee_count: 0,

      event_genre: Array.isArray(rest.event_genre)
        ? rest.event_genre
        : JSON.parse(rest.event_genre || '[]')
    };

    return formatted;

  } catch (error) {
    throw error;
  }
};


// ============================================================
// Get All Events
// ============================================================

export const getAllEventsRepository = async (
  params,
  institutionIds = [],
  user_id
) => {
  try {

    const {
      limitPlusOne = 20,
      offset = 0
    } = params;


    // ----------------------------------------------------------
    // Visibility
    // ----------------------------------------------------------

    const orConditions = [
      {
        scope: "public"
      }
    ];


    if (institutionIds.length > 0) {

      orConditions.push({
        [Op.and]: [
          {
            scope: "institution"
          },
          {
            '$event_institutions.institution_id$': {
              [Op.in]: institutionIds
            }
          }
        ]
      });

    }


    if (user_id) {

      orConditions.push({
        [Op.and]: [
          {
            scope: "private"
          },
          {
            organizer_id: user_id
          }
        ]
      });

    }


    const whereCondition = {
      [Op.or]: orConditions
    };


    // ----------------------------------------------------------
    // Ordering
    // ----------------------------------------------------------

    let orderArray = [
      ["created_at", "DESC"]
    ];


    if (institutionIds.length > 0) {

      const institutionIdList = institutionIds
        .map(id => Number(id))
        .join(',');


      orderArray = [

        [
          literal(`
            CASE
              WHEN "events"."scope" = 'institution'
              AND "event_institutions"."institution_id"
              IN (${institutionIdList})
              THEN 0
              ELSE 1
            END
          `),
          "ASC"
        ],

        ["created_at", "DESC"]

      ];

    }


    // ----------------------------------------------------------
    // Query
    // ----------------------------------------------------------

    const events = await Event.findAll({

      where: whereCondition,


      attributes: {

        // Don't return the stored attendee_count
        exclude: [
          "attendee_count"
        ],

        include: [

          [
            attendeeCountLiteral(),
            "attendee_count"
          ]

        ]

      },


      include: [

        {
          model: EventInstitution,
          as: "event_institutions",

          attributes: [
            "institution_id"
          ],

          required: false,

          where: institutionIds.length > 0
            ? {
                institution_id: {
                  [Op.in]: institutionIds
                }
              }
            : undefined
        }

      ],


      order: orderArray,

      limit: limitPlusOne,

      offset,

      subQuery: false,

      distinct: true

    });


    // ----------------------------------------------------------
    // Format
    // ----------------------------------------------------------

    const formattedEvents = events.map(event => {

      const json = event.toJSON();


      const result = {

        ...json,

        attendee_count: Number(
          json.attendee_count || 0
        ),

        event_genre: Array.isArray(json.event_genre)
          ? json.event_genre
          : JSON.parse(json.event_genre || "[]")

      };


      delete result.event_institutions;


      if (json.scope === "institution") {

        result.institutions =
          (json.event_institutions || []).map(inst =>
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


// ============================================================
// Get Event By ID
// ============================================================

export const getEventByIdRepository = async (eventId) => {

  try {

    const event = await Event.findByPk(eventId, {

      attributes: {

        exclude: [
          "attendee_count"
        ],

        include: [

          [
            attendeeCountLiteral(),
            "attendee_count"
          ]

        ]

      },


      include: [

        {

          model: EventInstitution,

          attributes: [
            "institution_id"
          ],

          required: false,

          include: [

            {

              model: Institution,

              as: "institution",

              attributes: [
                "institution_id",
                "name"
              ]

            }

          ]

        }

      ]

    });


    if (!event) {
      return null;
    }


    const json = event.toJSON();


    const formattedEvent = {

      ...json,

      attendee_count: Number(
        json.attendee_count || 0
      ),

      event_genre: Array.isArray(json.event_genre)
        ? json.event_genre
        : JSON.parse(json.event_genre || "[]")

    };


    delete formattedEvent.event_institutions;


    if (json.scope === "institution") {

      formattedEvent.institutions =
        (json.event_institutions || []).map(
          ({ institution }) => ({

            institution_id:
              institution.institution_id,

            name:
              institution.name

          })
        );

    }


    return formattedEvent;

  } catch (error) {

    throw error;

  }

};


// ============================================================
// Update Event
// ============================================================

export const updateEventRepository = async (
  eventId,
  eventData,
  userId
) => {

  try {

    const event = await Event.findByPk(eventId);


    if (!event) {

      return {
        status: "not_found"
      };

    }


    if (event.organizer_id !== userId) {

      return {
        status: "unauthorized"
      };

    }


    await event.update(eventData);


    // Fetch again so attendee_count is calculated
    // instead of using the stored value.

    const updatedEvent = await Event.findByPk(eventId, {

      attributes: {

        exclude: [
          "attendee_count"
        ],

        include: [

          [
            attendeeCountLiteral(),
            "attendee_count"
          ]

        ]

      }

    });


    const json = updatedEvent.toJSON();


    const formattedEvent = {

      ...json,

      attendee_count: Number(
        json.attendee_count || 0
      ),

      event_genre: Array.isArray(json.event_genre)
        ? json.event_genre
        : JSON.parse(json.event_genre || '[]')

    };


    return {

      status: "success",

      event: formattedEvent

    };

  } catch (error) {

    throw error;

  }

};


// ============================================================
// Delete Event
// ============================================================

export const deleteEventRepository = async (
  eventId,
  userId
) => {

  try {

    const event = await Event.findByPk(eventId);


    if (!event) {

      throw new Error(
        "Event not found"
      );

    }


    if (event.delete_tag === true) {

      throw new Error(
        "Event already deleted"
      );

    }


    if (event.organizer_id !== userId) {

      throw new Error(
        "Unauthorized: You cannot delete this event"
      );

    }


    await event.destroy();


    return {
      message: "Event deleted successfully"
    };

  } catch (error) {

    throw error;

  }

};


// ============================================================
// Search Events
// ============================================================

export const searchEventRepository = async (
  searchQuery
) => {

  try {

    const events = await Event.findAll({

      where: {

        [Op.or]: [

          {
            event_name: {
              [Op.iLike]: `%${searchQuery}%`
            }
          },

          {
            event_description: {
              [Op.iLike]: `%${searchQuery}%`
            }
          },

          {
            event_location: {
              [Op.iLike]: `%${searchQuery}%`
            }
          }

        ]

      },


      attributes: {

        exclude: [
          "attendee_count"
        ],

        include: [

          [
            attendeeCountLiteral(),
            "attendee_count"
          ]

        ]

      },


      order: [
        ["created_at", "DESC"]
      ]

    });


    const formattedEvents = events.map(event => {

      const json = event.toJSON();


      return {

        ...json,

        attendee_count: Number(
          json.attendee_count || 0
        ),

        event_genre: Array.isArray(json.event_genre)
          ? json.event_genre
          : JSON.parse(json.event_genre || '[]')

      };

    });


    return formattedEvents;

  } catch (error) {

    throw error;

  }

};


// ============================================================
// Get Events By Organizer
// ============================================================

export const getEventbyOrganizerIdRepository = async (
  organizerId
) => {

  try {

    const events = await Event.findAll({

      where: {
        organizer_id: organizerId
      },


      attributes: {

        exclude: [
          "attendee_count"
        ],

        include: [

          [
            attendeeCountLiteral(),
            "attendee_count"
          ]

        ]

      },


      order: [
        ["created_at", "DESC"]
      ],


      include: [

        {

          model: EventInstitution,

          attributes: [
            "institution_id"
          ],

          required: false,

          include: [

            {

              model: Institution,

              as: "institution",

              attributes: [
                "institution_id",
                "name"
              ]

            }

          ]

        }

      ]

    });


    const formattedEvents = events.map(event => {

      const json = event.toJSON();


      const formattedEvent = {

        ...json,

        attendee_count: Number(
          json.attendee_count || 0
        ),

        event_genre: Array.isArray(json.event_genre)
          ? json.event_genre
          : JSON.parse(json.event_genre || "[]")

      };


      delete formattedEvent.event_institutions;


      if (json.scope === "institution") {

        formattedEvent.institutions =
          (json.event_institutions || []).map(
            ({ institution }) => ({

              institution_id:
                institution.institution_id,

              name:
                institution.name

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


// ============================================================
// Get Events By Tags
// ============================================================

export const getEventByTagsRepository = async (
  tags
) => {

  try {

    const events = await Event.findAll({

      where: {

        event_genre: {

          [Op.overlap]: tags

        }

      },


      attributes: {

        exclude: [
          "attendee_count"
        ],

        include: [

          [
            attendeeCountLiteral(),
            "attendee_count"
          ]

        ]

      },


      order: [
        ["created_at", "DESC"]
      ]

    });


    return events.map(event => {

      const json = event.toJSON();


      return {

        ...json,

        attendee_count: Number(
          json.attendee_count || 0
        ),

        event_genre:
          json.event_genre ?? []

      };

    });

  } catch (error) {

    throw error;

  }

};