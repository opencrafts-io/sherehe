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
    pgm.renameColumn("ticket", "attendeeId", "attendeeid");
    pgm.renameColumn("ticket", "eventId", "eventid");
    pgm.renameColumn("ticket", "paymentCode", "paymentcode");
    pgm.renameColumn("ticket", "createdAt", "createdat");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.renameColumn("ticket", "attendeeid", "attendeeId");
    pgm.renameColumn("ticket", "eventid", "eventId");
    pgm.renameColumn("ticket", "paymentcode", "paymentCode");
    pgm.renameColumn("ticket", "createdat", "createdAt");
};
