/* eslint-disable camelcase */

export const up = pgm => {
  // Step 1: Add nullable columns
  pgm.addColumns('events', {
    poster: { type: 'varchar' },
    banner: { type: 'varchar' },
  });

  // Step 2: Backfill with empty string
  pgm.sql(`UPDATE events SET poster = '', banner = '' WHERE poster IS NULL OR banner IS NULL;`);

  // Step 3: Make them NOT NULL
  pgm.alterColumn('events', 'poster', { notNull: true });
  pgm.alterColumn('events', 'banner', { notNull: true });
};

export const down = pgm => {
  pgm.dropColumns('events', ['poster', 'banner']);
};
