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
    pgm.alterColumn("attendees", "createdAt", {
    type: "timestamptz",
    using: `"createdAt" AT TIME ZONE 'UTC'`,
  });

  pgm.alterColumn("ticket", "createdAt", {
    type: "timestamptz",
    using: `"createdAt" AT TIME ZONE 'UTC'`,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.alterColumn("attendees", "createdAt", {
    type: "timestamp",
    using: `"createdAt" AT TIME ZONE 'UTC'`,
  });

  pgm.alterColumn("ticket", "createdAt", {
    type: "timestamp",
    using: `"createdAt" AT TIME ZONE 'UTC'`,
  });
};
