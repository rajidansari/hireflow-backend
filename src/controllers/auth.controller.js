import pool from '../db/db.js';
import { hashPassword } from '../utils/hash.utils.js';
import {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
} from '../utils/jwt.utils.js';
import { generateOtp } from '../utils/otp.utils.js';
import { sendOtpEmail } from '../services/sendEmail.service.js';
import { config } from '../config/index.js';

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
      await client.query(`INSERT INTO candidate_profiles (user_id) VALUES ($1)`, [newUser.id]);
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

// verify user email
const verifyUserEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {

    const result = await pool.query(
      `SELECT id, role FROM users WHERE email=$1 AND otp=$2 AND NOW() < otp_expiry`,
      [email, otp]
    );

    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid otp or expired' });
    }

    await pool.query(
      `UPDATE users SET
      is_verified=true,
      otp=null,
      otp_expiry=null
      WHERE id=$1`,
      [user.id]
    );

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({message: "Verification success", accessToken});

  } catch (err) {
    console.log(`User email verification failed :: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { registerUserWithProfile, verifyUserEmail };
