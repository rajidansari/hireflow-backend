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
			CREATE TABLE users (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				email TEXT NOT NULL UNIQUE,
				password_hash TEXT NOT NULL,
				role user_role NOT NULL,
				is_verified BOOLEAN NOT NULL DEFAULT false,
				otp TEXT,
				otp_expiry TIMESTAMPTZ,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);
		`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
	pgm.sql(`
			DROP TABLE IF EXISTS users;
		`)
};
