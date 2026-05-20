import { cloudinary } from '../services/cloudinary.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileUnlink } from '../utils/fileUnlink.utils.js';
import pool from '../db/db.js';

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

export { createJobApplication };
