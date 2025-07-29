
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
  pgm.createTable("events", {
    id: "id",
    name: { type: "varchar", notNull: true },
    description: { type: "varchar", notNull: true },
    url: { type: "varchar", notNull: true},
    location: { type: "varchar", notNull: true },
    time: { type: "time", notNull: true},
    date: { type: "date", notNull: true},
    organizer: { type: "varchar", notNull: true},
    imageurl: { type: "varchar", notNull: true },
    numberofattendees: { type: "integer", notNull: true },
    organizerid: { type: "integer", notNull: true },
    createdat: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("TIMEZONE('UTC', CURRENT_TIMESTAMP)")
    },
  });
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("events");
};
