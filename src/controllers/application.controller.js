import { cloudinary } from '../services/cloudinary.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileUnlink } from '../utils/fileUnlink.utils.js';
import pool from '../db/db.js';
import { jobApplicationsSchema } from '../validators/application.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createJobApplication = async (req, res) => {
  const coverNote = req.body?.coverNote;
  const jobId = req.params?.jobId;
  try {
    let filePath = req.file
      ? path.join(__dirname, '../../public/uploads', req.file.filename)
      : null;

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
    console.log(`Job application failed :: ${err}`);
    if (req.file) {
      fileUnlink(filePath);
    }
    res.status(500).json({ message: err.message });
  }
};

// get all applications for a specific job
const getJobApplications = async (req, res) => {
  const jobId = req.params?.jobId;
  try {
    const validatedQueries = jobApplicationsSchema.safeParse(req.query);

    const { limit, page, status, sort } = validatedQueries.data;

    const offset = (page - 1) * limit;

    // base query parts
    const filters = [];
    const values = [];

    // filters
    if (jobId) {
      values.push(jobId);
      filters.push(`job_id = $${values.length}`);
    }

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
    let whereClause = null;

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
      success: true,

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
    console.log(`failed to fetch job applications :: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { createJobApplication, getJobApplications };
