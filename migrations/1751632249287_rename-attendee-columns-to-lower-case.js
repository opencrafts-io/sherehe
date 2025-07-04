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
    pgm.renameColumn("attendees", "firstName", "firstname");
    pgm.renameColumn("attendees", "middleName", "middlename");
    pgm.renameColumn("attendees", "lastName", "lastname");
    pgm.renameColumn("attendees", "eventId", "eventid");
    pgm.renameColumn("attendees", "ticketId", "ticketid");
    pgm.renameColumn("attendees", "createdAt", "createdat");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.renameColumn("attendees", "firstname", "firstName");
    pgm.renameColumn("attendees", "middlename", "middleName");
    pgm.renameColumn("attendees", "lastname", "lastName");
    pgm.renameColumn("attendees", "eventid", "eventId");
    pgm.renameColumn("attendees", "ticketid", "ticketId");
    pgm.renameColumn("attendees", "createdat", "createdAt");
};
