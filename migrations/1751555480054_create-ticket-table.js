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
    pgm.createTable("ticket", {
        id: "id",
        attendeeId: {
            type: "integer",
            notNull: true,
            references: "attendees",
            onDelete: "CASCADE"
        },
        eventId: {
            type: "integer",
            notNull: true,
            references: "events",
            onDelete: "CASCADE"
        },
        paymentCode: {type: "varchar", notNull: true},
        createdAt: {
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
    pgm.dropTable("ticket");
};
