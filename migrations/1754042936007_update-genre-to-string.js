/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = async(pgm) => {
    // Step 1: Add temporary column
    pgm.addColumn('events', {
        genre_string: { type: 'text' }, // allow nulls for now
    });

    // Step 2: Copy data from text[] column into string format
    await pgm.sql(`
        UPDATE events
        SET genre_string = array_to_string(genre, ', ');
    `);

    // Step 3: Drop old column
    pgm.dropColumn('events', 'genre');

    // Step 4: Rename genre_string to genre
    pgm.renameColumn('events', 'genre_string', 'genre');

    // Step 5 (optional): If you want to enforce not null
    pgm.alterColumn('events', 'genre', { notNull: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = async(pgm) => {
    // Step 1: Add back the original array column
    pgm.addColumn('events', {
        genre_array: { type: 'text[]' },
    });

    // Step 2: Convert string back to array
    await pgm.sql(`
        UPDATE events
        SET genre_array = string_to_array(genre, ',');
    `);

    // Step 3: Drop the string column
    pgm.dropColumn('events', 'genre');

    // Step 4: Rename genre_array back to genre
    pgm.renameColumn('events', 'genre_array', 'genre');

    // Step 5 (optional): Add not null constraint
    pgm.alterColumn('events', 'genre', { notNull: true });
};
