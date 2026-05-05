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
			CREATE TABLE jobs (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
				title TEXT NOT NULL,
				description TEXT NOT NULL,
				skills TEXT[] NOT NULL,
				location TEXT NOT NULL,
				salary_min INT,
				salary_max INT,
				is_negotiable BOOLEAN NOT NULL DEFAULT false,
				status job_status NOT NULL DEFAULT 'active',
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);

			CREATE TRIGGER set_jobs_updated_at
			BEFORE UPDATE ON jobs
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
			DROP TRIGGER IF EXISTS set_jobs_updated_at ON jobs;

			DROP TABLE IF EXISTS jobs;
		`)
};
