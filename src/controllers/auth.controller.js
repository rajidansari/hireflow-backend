import pool from '../db/db.js';
import { hashPassword } from '../utils/hash.utils.js';
import {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
} from '../utils/jwt.utils.js';
import { generateOtp } from '../utils/otp.utils.js';
import { sendOtpEmail } from '../services/sendEmail.service.js';

const registerUserWithProfile = async (req, res) => {
  const { fullname, email, password, role, companyName, industry, location } = req.body;

  const client = await pool.connect();
  try {
    const hashedPassword = await hashPassword(password);

    const otp = generateOtp();

    await client.query('BEGIN');

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role, fullname, otp, otp_expiry) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '15 minutes') RETURNING id, email, role`,
      [email, hashedPassword, role, fullname, otp]
    );

    const newUser = userRes.rows[0];

    if (newUser.role === 'candidate') {
      await client.query(
        `INSERT INTO candidate_profiles (user_id) VALUES ($1)`,
        [newUser.id]
      );
    } else if (newUser.role === 'employer') {
      await client.query(
        `INSERT INTO employer_profiles (user_id, company_name, industry, location) VALUES ($1, $2, $3, $4)`,
        [newUser.id, companyName, industry, location]
      );
    }

    await client.query('COMMIT');

    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'Verify your email' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(`user register error :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

export { registerUserWithProfile };
