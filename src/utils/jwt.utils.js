import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// access token
function generateAccessToken(userId, role) {
  const token = jwt.sign({ userId, role }, config.jwt.accessTokenKey, { expiresIn: '15m' });

  return token;
}

function validateAccessToken(token) {
  const decoded = jwt.verify(token, config.jwt.accessTokenKey);
  return decoded;
}

// refresh token
function generateRefreshToken(userId) {
  const token = jwt.sign({ userId }, config.jwt.refreshTokenKey, { expiresIn: '7d' });

  return token;
}

function validateRefreshToken(token) {
  const decoded = jwt.verify(token, config.jwt.refreshTokenKey);

  return decoded;
}

export { generateAccessToken, validateAccessToken, generateRefreshToken, validateRefreshToken };
