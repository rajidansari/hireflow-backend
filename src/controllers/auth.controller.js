import pool from '../db/db.js';
import { comparePassword, hashPassword } from '../utils/hash.utils.js';
import {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
} from '../utils/jwt.utils.js';
import { generateOtp } from '../utils/otp.utils.js';
import { sendOtpEmail, sendPasswordResetOtp } from '../services/sendEmail.service.js';
import { config } from '../config/index.js';
import jwt from 'jsonwebtoken';

const registerUserWithProfile = async (req, res) => {
  const { fullname, email, password, role, companyName, industry, location } = req.body;

  const client = await pool.connect();
  try {
    const hashedPassword = await hashPassword(password);

    const otp = generateOtp();

    const isAlreadyUser = await pool.query(`SELECT email FROM users WHERE email = $1`, [email]);
    if (isAlreadyUser.rows[0]) {
      return res.status(400).json({ message: 'Email is already registered, try logging!' });
    }

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
      secure: config.nodeEnv === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Verification success', accessToken });
  } catch (err) {
    console.log(`User email verification failed :: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, role, is_verified, password_hash FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const dummyHash = '$2b$10$invalidhashfortimingreasons';

    const isMatched = await comparePassword(password, user ? user.password_hash : dummyHash);

    if (!isMatched) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login success', accessToken });
  } catch (err) {
    console.log(`User login failed :: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// logout user
const logoutUser = async (req, res) => {
  try {
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'User logout success' });
  } catch (err) {
    console.log(`user logout failed :: ${err}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// refresh access token
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized access denied' });

    const decoded = validateRefreshToken(refreshToken);

    const result = await pool.query(`SELECT id, role FROM users WHERE id=$1`, [decoded.userId]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const accessToken = generateAccessToken(user.id, user.role);

    res.status(200).json({ message: 'Refresh success', accessToken });
  } catch (err) {
    console.log(`Refresh access token failed :: ${err}`);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// forgot password
const forgotUserPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);

    const user = result.rows[0];

    if (!user) {
      return res.status(200).json({ message: 'Check your email for otp' });
    }

    const otp = generateOtp();
    await pool.query(
      `UPDATE users SET otp = $1, otp_expiry = NOW() + INTERVAL '10 minutes' WHERE id=$2`,
      [otp, user.id]
    );

    await sendPasswordResetOtp(email, otp);

    res.status(200).json({ message: 'Check your email for otp' });
  } catch (err) {
    console.log(`forgot password failed :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// verify reset password otp
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND otp = $2 AND NOW() < otp_expiry`,
      [email, otp]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired otp' });
    }

    await pool.query(`UPDATE users SET otp=null, otp_expiry=null WHERE id=$1`, [user.id]);

    const resetToken = jwt.sign({ userId: user.id }, config.jwt.resetTokenKey, {
      expiresIn: '10m',
    });

    res.cookie('resetToken', resetToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'Lax',
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).json({ message: 'otp verification success' });
  } catch (err) {
    console.log(`verify reset otp failed :: ${err}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// reset user password
const resetUserPassword = async (req, res) => {
  const { password } = req.body;

  try {
    const resetToken = req.cookies?.resetToken;
    if (!resetToken) return res.status(401).json({ message: 'Unauthorize access denied' });

    const decoded = jwt.verify(resetToken, config.jwt.resetTokenKey);

    const result = await pool.query(`SELECT id FROM users WHERE id=$1`, [decoded.userId]);

    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: 'Invalid or expired token' });

    const hashedPassword = await hashPassword(password);

    await pool.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hashedPassword, user.id]);

    res.clearCookie('resetToken');

    res.status(200).json({ message: 'Password reset success' });
  } catch (err) {
    console.log(`Reset password failed :: ${err}`);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  registerUserWithProfile,
  verifyUserEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotUserPassword,
  verifyResetOtp,
  resetUserPassword,
};
