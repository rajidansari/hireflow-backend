import { cloudinary } from '../services/cloudinary.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileUnlink } from '../utils/fileUnlink.utils.js';
import pool from '../db/db.js';
import { jobApplicationsSchema, myApplicationsSchema } from '../validators/application.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createJobApplication = async (req, res) => {
  const coverNote = req.body?.coverNote;
  const jobId = req.params?.jobId;

  let filePath = req.file ? path.join(__dirname, '../../public/uploads', req.file.filename) : null;

  try {
    let cvUrl = null;

    const candProfResult = await pool.query(
      `SELECT id, default_cv_url FROM candidate_profiles WHERE user_id=$1`,
      [req.user.userId]
    );

    const candidate = candProfResult.rows[0];

    if (!candidate) return res.status(403).json({ message: 'Unauthorized access denied' });

    const candidateId = candidate.id;

    // check if candidate has already applied
    const isAlreadyApplied = await pool.query(
      `SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2`,
      [jobId, candidateId]
    );

    if (isAlreadyApplied.rows.length > 0) {
      fileUnlink(filePath);
      return res.status(409).json({ message: 'You have already applied to this job' });
    }

    // check if req has file
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        folder: 'candidates_cvs',
        public_id: req.file.filename,
      });

      if (uploadResult) {
        cvUrl = uploadResult.secure_url;
        fileUnlink(filePath);
      }
    }

    const cv_url = cvUrl || candidate.default_cv_url;

    if (!cv_url) {
      return res.status(400).json({ message: 'Upload cv to continue applying' });
    }

    const applicationResult = await pool.query(
      `INSERT INTO applications (job_id, candidate_id, cv_url, cover_note) VALUES ($1, $2, $3, $4) RETURNING *`,
      [jobId, candidateId, cv_url, coverNote]
    );

    res.status(201).json({ message: 'Applied successfully', data: applicationResult.rows[0] });
  } catch (err) {
    console.error(`Job application failed :: ${err}`);
    if (req.file) {
      fileUnlink(filePath);
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get all applications for a specific job
const getJobApplications = async (req, res) => {
  const jobId = req.params?.jobId;
  try {
    const validatedQueries = jobApplicationsSchema.safeParse(req.query);

    const { limit, page, status, sort } = validatedQueries.data;

    const offset = (page - 1) * limit;

    const jobResult = await pool.query(
      `SELECT jobs.id FROM jobs
       INNER JOIN employer_profiles
       ON jobs.employer_id = employer_profiles.id
       WHERE jobs.id = $1 AND employer_profiles.user_id = $2
      `,
      [jobId, req.user.userId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized access denied' });
    }

    // base query parts
    const filters = [];
    const values = [];

    // filters
    values.push(jobId);
    filters.push(`job_id = $${values.length}`);

    if (status) {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }

    const sortOptions = {
      newest: 'applied_at DESC',
      oldest: 'applied_at ASC',
    };

    const orderBy = sortOptions[sort] || sortOptions['newest'];

    // where clause
    let whereClause = '';

    if (filters.length > 0) {
      whereClause = `WHERE ${filters.join(' AND ')}`;
    }

    const resultCountQuery = `
      SELECT COUNT(id) AS total FROM applications ${whereClause}
    `;

    const mainQuery = `
      SELECT
        id,
        job_id,
        candidate_id,
        cv_url,
        status,
        cover_note,
        applied_at
      FROM applications

      ${whereClause}

      ORDER BY ${orderBy}

      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const [applicationResult, countResult] = await Promise.all([
      pool.query(mainQuery, [...values, limit, offset]),
      pool.query(resultCountQuery, values),
    ]);

    // pagination info
    const totalResults = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
      pagination: {
        page: page,
        per_page: limit,
        total_pages: totalPages,
        total_results: totalResults,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },

      filters: {
        status: status || null,
        limit: limit || null,
        sort,
      },

      data: applicationResult.rows,
    });
  } catch (err) {
    console.error(`failed to fetch job applications :: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get my applications
const getMyApplications = async (req, res) => {
  try {
    const validatedQueries = myApplicationsSchema.safeParse(req.query);

    const { status, limit, page, sort } = validatedQueries.data;

    const candProfResult = await pool.query(
      `SELECT id FROM candidate_profiles WHERE user_id = $1`,
      [req.user.userId]
    );

    const candidate = candProfResult.rows[0];

    if (!candidate) return res.status(403).json({ message: 'Unauthorized access denied' });

    const candidateId = candidate.id;

    const offset = (page - 1) * limit;

    // base query parts
    const filters = [`candidate_id = $1`];
    const values = [candidateId];

    // filters
    if (status) {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }

    // sorting
    const sortOptions = {
      newest: 'applied_at DESC',
      oldest: 'applied_at ASC',
    };

    const orderBy = sortOptions[sort] || sortOptions['newest'];

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const resultCountQuery = `
      SELECT COUNT(id) AS total FROM applications ${whereClause}
    `;

    const mainQuery = `
      SELECT
        id,
        job_id,
        candidate_id,
        cv_url,
        status,
        cover_note,
        applied_at
      FROM applications
      
      ${whereClause}

      ORDER BY ${orderBy}
      
      LIMIT $${values.length + 1}

      OFFSET $${values.length + 2}
    `;

    const [countResult, applicationResult] = await Promise.all([
      pool.query(resultCountQuery, values),
      pool.query(mainQuery, [...values, limit, offset]),
    ]);

    const totalResults = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
      pagination: {
        page: page,
        per_page: limit,
        total_results: totalResults,
        total_pages: totalPages,
        has_next_page: totalPages > page,
        has_prev_page: page > 1,
        sort,
      },

      filters: {
        status: status || null,
      },
      data: applicationResult.rows,
    });
  } catch (err) {
    console.error(`Failed to fetch my applications :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const withdrawApplication = async (req, res) => {
  const applicationId = req.params?.id;

  try {
    const candProfResult = await pool.query(
      `SELECT id FROM candidate_profiles WHERE user_id = $1`,
      [req.user.userId]
    );

    const candidate = candProfResult.rows[0];

    if (!candidate) return res.status(403).json({ message: 'Unauthorized access denied' });

    const candidateId = candidate.id;

    const applicationResult = await pool.query(
      `DELETE FROM applications WHERE id = $1 AND candidate_id = $2 RETURNING id`,
      [applicationId, candidateId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application withdraw success' });
  } catch (err) {
    console.error(`Failed to withdraw application :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// update application status
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params?.id;

  try {
    const applicationResult = await pool.query(
      `
        UPDATE applications
          SET status = $1
        WHERE applications.id = $2
        AND applications.job_id IN (
          SELECT jobs.id FROM jobs
          INNER JOIN employer_profiles
          ON employer_profiles.id = jobs.employer_id
          WHERE employer_profiles.user_id = $3
        )
        RETURNING id, status
      `,
      [status, applicationId, req.user.userId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Updated successfully', data: applicationResult.rows[0] });
  } catch (err) {
    console.error(`Failed to update application status :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  createJobApplication,
  getJobApplications,
  getMyApplications,
  withdrawApplication,
  updateApplicationStatus,
};
