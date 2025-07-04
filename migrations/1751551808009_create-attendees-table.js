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
    pgm.createTable("attendees", {
        id: "id",
        firstName: {type: "varchar", notNull: true},
        middleName: {type: "varchar", notNull: false},
        lastName: {type: "varchar", notNull: true},
        eventId: {
            type: "integer",
            notNull: true,
            references: "events",
            onDelete: "CASCADE"
        },
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
    pgm.dropTable("attendees");
};
