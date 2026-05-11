import pool from '../db/db.js';

const createJob = async (req, res) => {
  const { title, description, skills, location, salaryMin, salaryMax } = req.body;

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
      [employerId, title, description, skills, location, salaryMin, salaryMax]
    );

    const newJob = jobResult.rows[0];

    res.status(201).json({ message: 'Job created', job: newJob });
  } catch (err) {
    console.log(`Job creation failed :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { createJob };
