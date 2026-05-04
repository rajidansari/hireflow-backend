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
				CREATE TABLE candidate_profiles (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
				fullname TEXT NOT NULL,
				headline TEXT,
				description TEXT,
				skills TEXT[],
				location TEXT,
				default_cv_url TEXT,
				portfolio_url TEXT,
				updated_at TIMESTAMPTZ DEFAULT NOW()
			);

			CREATE TRIGGER set_candidate_profiles_updated_at
			BEFORE UPDATE ON candidate_profiles
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
			DROP TRIGGER IF EXISTS set_candidate_profiles_updated_at ON candidate_profiles;
			DROP TABLE IF EXISTS candidate_profiles;
		`);
};
