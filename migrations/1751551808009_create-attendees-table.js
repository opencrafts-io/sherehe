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
        firstname: {type: "varchar", notNull: true},
        middlename: {type: "varchar", notNull: false},
        lastname: {type: "varchar", notNull: true},
        eventid: {
            type: "integer",
            notNull: true,
            references: "events",
            onDelete: "CASCADE"
        },
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
    pgm.dropTable("attendees");
};
