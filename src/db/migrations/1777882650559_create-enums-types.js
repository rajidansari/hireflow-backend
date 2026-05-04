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
	pgm.sql(`
			CREATE TYPE user_role AS ENUM('candidate', 'employer');
			CREATE TYPE job_status AS ENUM('draft', 'active', 'expired');
			CREATE TYPE app_status AS ENUM('pending', 'reviewed', 'hired', 'rejected');
		`)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
	pgm.sql(`
			DROP TYPE user_role IF EXISTS;
			DROP TYPE job_status IF EXISTS;
			DROP TYPE app_status IF EXISTS;
		`)
};
