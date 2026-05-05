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
			ALTER TABLE users
			ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

			CREATE TRIGGER set_users_updated_at
			BEFORE UPDATE ON users
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at();
		`)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
	pgm.sql(`
			DROP TRIGGER IF EXISTS set_users_updated_at ON users;

			ALTER TABLE users
			DROP COLUMN updated_at;
		`)
};
