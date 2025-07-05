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
    pgm.createTable("tickets", {
        id: "id",
        attendeeid: {
            type: "integer",
            notNull: true,
            references: "attendees(id)",
            onDelete: "CASCADE"
        },
        eventid: {
            type: "integer",
            notNull: true,
            references: "events",
            onDelete: "CASCADE"
        },
        paymentcode: {type: "varchar", notNull: true},
        createdat: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("TIMEZONE('UTC', CURRENT_TIMESTAMP)")
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("tickets");
};
