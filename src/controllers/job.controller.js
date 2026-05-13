import pool from '../db/db.js';
import { getAllJobSchema } from '../validators/job.schema.js';

const createJob = async (req, res) => {
  const { title, description, skills, location, salary_min, salary_max } = req.body;

  try {
    const empResult = await pool.query(`SELECT id FROM employer_profiles WHERE user_id = $1`, [
      req.user.userId,
    ]);

    const employerId = empResult.rows[0].id;

    if (!employerId) {
      return res.status(403).json({ message: 'You are not authorize to perform this action' });
    }

    const jobResult = await pool.query(
      `INSERT INTO jobs (employer_id, title, description, skills, location, salary_min, salary_max) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title`,
      [employerId, title, description, skills, location, salary_min, salary_max]
    );

    const newJob = jobResult.rows[0];

    res.status(201).json({ message: 'Job created', job: newJob });
  } catch (err) {
    console.log(`Job creation failed :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get all jobs
const getAllJob = async (req, res) => {
  try {
    const validatedQueryParams = getAllJobSchema.safeParse(req.query);

    const { title, location, skills, salary_min, salary_max, page, limit, sort } =
      validatedQueryParams.data;

    const offset = (page - 1) * limit;

    // base query parts
    const filters = [];
    const values = [];

    // filters

    // title search
    if (title) {
      values.push(`%${title.trim()}%`);

      filters.push(`
        (
          jobs.title ILIKE $${values.length} OR
          jobs.description ILIKE $${values.length}
        )
      `);
    }

    // location search
    if (location) {
      values.push(`%${location}%`);

      filters.push(`jobs.location ILIKE $${values.length}`);
    }

    // skills search
    if (skills && skills.length > 0) {
      values.push(skills);

      filters.push(`jobs.skills && $${values.length}::text[]`);
    }

    // salary range
    if (salary_min) {
      values.push(salary_min);

      filters.push(`jobs.salary_min >= $${values.length}`);
    }

    if (salary_max) {
      values.push(salary_max);

      filters.push(`jobs.salary_max <= $${values.length}`);
    }

    // status filter
    filters.push(`jobs.status = 'active'`);

    // where clause
    let whereClause = '';

    if (filters.length > 0) {
      whereClause = `WHERE ${filters.join(' AND ')}`;
    }

    // sorting
    const sortOptions = {
      newest: 'jobs.created_at DESC',
      oldest: 'jobs.created_at ASC',

      salary_high: 'jobs.salary_max DESC',
      salary_low: 'jobs.salary_max ASC',
    };

    const orderBy = sortOptions[sort] || sortOptions.newest;

    // main query
    const jobsQuery = `
      SELECT
        jobs.id,
        jobs.title,
        jobs.skills,
        jobs.salary_min,
        jobs.salary_max,
        jobs.location,

        employer_profiles.id AS employer_id,
        employer_profiles.company_name AS company_name

      FROM jobs

      INNER JOIN employer_profiles
      ON employer_profiles.id = jobs.employer_id

      ${whereClause}

      ORDER BY ${orderBy}

      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    // result count query
    const countQuery = `
      SELECT COUNT(jobs.id) AS total FROM jobs
      JOIN employer_profiles
      ON employer_profiles.id = jobs.employer_id

      ${whereClause}
    `;

    // execute query
    const [jobsResult, countResult] = await Promise.all([
      pool.query(jobsQuery, [...values, limit, offset]),
      pool.query(countQuery, values),
    ]);

    // pagination info
    const totalResults = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(totalResults / limit);

    // response
    res.status(200).json({
      message: 'success',

      pagination: {
        page: page,
        per_page: limit,
        total_pages: totalPages,
        total_results: totalResults,

        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },

      filters: {
        title: title || null,
        location: location || null,
        skills: skills || null,
        salary_min: salary_min || null,
        salary_max: salary_max || null,
        sort,
      },

      data: jobsResult.rows,
    });
  } catch (err) {
    console.log(`Failed to fetch jobs :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get a single job detail
const getJobDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
          j.id,
          j.title,
          j.description,
          j.skills,
          j.location,
          j.salary_min,
          j.salary_max,
          j.status,
          j.created_at,

          ep.id AS employer_id,
          ep.company_name,
          ep.logo_url,
          ep.website
        FROM jobs j
        INNER JOIN employer_profiles ep
        ON ep.id = j.employer_id

        WHERE j.id = $1;
      `,
      [id]
    );

    const job = result.rows[0];

    if (!job) return res.status(404).json({ message: 'Request job not found' });

    res.status(200).json({ message: 'success', data: job });
  } catch (err) {
    console.log(`Failed to fetch job details :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { createJob, getAllJob, getJobDetails };
