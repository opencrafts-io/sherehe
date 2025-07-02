
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
    description: { type: "varchar", notNull: true },
    url: { type: "varchar", notNull: true},
    location: { type: "varchar", notNull: true },
    time: { type: "varchar", notNull: true},
    date: { type: "varchar", notNull: true},
    organizer: { type: "varchar", notNull: true},
    imageurl: { type: "varchar", notNull: true },
    numberofattendees: { type: "varchar", notNull: true },
    organizerid: { type: "varchar", notNull: true },
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
