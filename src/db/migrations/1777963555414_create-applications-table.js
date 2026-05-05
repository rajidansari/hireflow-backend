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
			CREATE TABLE applications (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
				candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
				cv_url TEXT,
				status app_status NOT NULL DEFAULT 'pending',
				cover_note TEXT,
				applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

				CONSTRAINT unique_job_candidate UNIQUE(job_id, candidate_id)
			);
		`)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
	pgm.sql(`
			DROP TABLE IF EXISTS applications;
		`)
};
