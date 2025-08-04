/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    // Events table column renames
    pgm.renameColumn('events', 'imageurl', 'image_url');
    pgm.renameColumn('events', 'numberofattendees', 'number_of_attendees');
    pgm.renameColumn('events', 'organizerid', 'organizer_id');
    pgm.renameColumn('events', 'createdat', 'created_at');
    
    // Attendees table column renames
    pgm.renameColumn('attendees', 'firstname', 'first_name');
    pgm.renameColumn('attendees', 'middlename', 'middle_name');
    pgm.renameColumn('attendees', 'lastname', 'last_name');
    pgm.renameColumn('attendees', 'eventid', 'event_id');
    pgm.renameColumn('attendees', 'createdat', 'created_at');
    
    // Tickets table column renames
    pgm.renameColumn('tickets', 'attendeeid', 'attendee_id');
    pgm.renameColumn('tickets', 'eventid', 'event_id');
    pgm.renameColumn('tickets', 'paymentcode', 'payment_code');
    pgm.renameColumn('tickets', 'createdat', 'created_at');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    // Events table - revert column renames
    pgm.renameColumn('events', 'image_url', 'imageurl');
    pgm.renameColumn('events', 'number_of_attendees', 'numberofattendees');
    pgm.renameColumn('events', 'organizer_id', 'organizerid');
    pgm.renameColumn('events', 'created_at', 'createdat');
    
    // Attendees table - revert column renames
    pgm.renameColumn('attendees', 'first_name', 'firstname');
    pgm.renameColumn('attendees', 'middle_name', 'middlename');
    pgm.renameColumn('attendees', 'last_name', 'lastname');
    pgm.renameColumn('attendees', 'event_id', 'eventid');
    pgm.renameColumn('attendees', 'created_at', 'createdat');
    
    // Tickets table - revert column renames
    pgm.renameColumn('tickets', 'attendee_id', 'attendeeid');
    pgm.renameColumn('tickets', 'event_id', 'eventid');
    pgm.renameColumn('tickets', 'payment_code', 'paymentcode');
    pgm.renameColumn('tickets', 'created_at', 'createdat');
};
