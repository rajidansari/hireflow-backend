/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = pgm => {
  pgm.sql(`
			CREATE TABLE employer_profiles (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
				fullname TEXT NOT NULL,
				company_name TEXT NOT NULL,
				logo_url TEXT,
				website TEXT,
				industry TEXT NOT NULL,
				bio TEXT,
				location TEXT NOT NULL,
				updated_at TIMESTAMPTZ DEFAULT NOW()
			);

			CREATE TRIGGER set_employer_profiles_updated_at
			BEFORE UPDATE ON employer_profiles
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at();
		`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = pgm => {
	pgm.sql(`
			DROP TRIGGER IF EXISTS set_employer_profiles_updated_at ON emmployer_profiles;
			DROP TABLE IF EXISTS employer_profiles;
		`)
};
