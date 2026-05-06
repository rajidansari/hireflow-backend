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
  const { fullname, email, password, role } = req.body;

  const client = await pool.connect();
  try {
    const hashedPassword = await hashPassword(password);

    const otp = generateOtp();

    await client.query('BEGIN');

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role, otp, otp_expiry) VALUES ($1, $2, $3, $4, NOW() + INTERVAL '15 minutes') RETURNING id, email, role`,
      [email, hashedPassword, role, otp]
    );

    const newUser = userRes.rows[0];

    if (newUser.role === 'candidate') {
      const candProfRes = await client.query(
        `INSERT INTO candidate_profiles (user_id, fullname) VALUES ($1, $2)`,
        [newUser.id, fullname]
      );
    } else if (newUser.role === 'employer') {
      const empProfRes = await client.query(
        `INSERT INTO employer_profiles (user_id, fullname) VALUES ($1, $2)`,
        [newUser.id, fullname]
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
