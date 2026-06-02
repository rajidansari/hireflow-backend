import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from '../validators/auth.schema.js';

import {
  registerUserWithProfile,
  verifyUserEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotUserPassword,
  verifyResetOtp,
  resetUserPassword,
} from '../controllers/auth.controller.js';

import auth from '../middleware/auth.middleware.js';
import { standardLimiter, strictLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

/**
 * @swagger
 *  /auth/register:
 *    post:
 *      summary: Register user
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - fullname
 *                - email
 *                - password
 *                - role
 *              properties:
 *                fullname:
 *                  type: string
 *                  example: Rajid Ansari
 *                email:
 *                  type: string
 *                  example: rajid@example.com
 *                password:
 *                  type: string
 *                  example: Rajid@123
 *                role:
 *                  type: string
 *                  enum:
 *                    - candidate
 *                    - employer
 *                  example: candidate
 *                companyName:
 *                  type: string
 *                  example: abc company
 *                  description: Required when role is employer
 *                industry:
 *                  type: string
 *                  example: IT
 *                  description: Required when role is employer
 *                location:
 *                  type: string
 *                  example: New delhi
 *                  description: Required when role is employer
 *
 *      responses:
 *        201:
 *          description: User registered successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Verify your email
 *        400:
 *          description: Validation failed
 *        409:
 *          description: Email already exists
 *        500:
 *          description: Internal server error
 */
router.post('/register', standardLimiter, validate(registerSchema), registerUserWithProfile);

/**
 * @swagger
 *  /auth/verify-email:
 *    patch:
 *      summary: Verify your email
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - otp
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rajid@example.com
 *                otp:
 *                  type: string
 *                  example: 123456
 *
 *      responses:
 *        200:
 *          description: Email verified
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Verification success
 *                  accessToken:
 *                    type: string
 *                    example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNmZkYTQxOS0wNDk1LTQwNWQtYjU5Ny1iNjFlZjc4YzBiOWQiLCJyb2xlIjoiZW1wbG95ZXIiLCJpYXQiOjE3ODA0MDY4MDYsImV4cCI6MTc4MDQwNzcwNn0.KJ_HMzRqfUNrM8EYwdR0ewbq3EvXmpaYcZ6p34B6RVA
 *
 *        400:
 *          description: Validation failed
 *        404:
 *          description: Invalid otp or expired
 */
router.patch('/verify-email', standardLimiter, validate(verifyEmailSchema), verifyUserEmail);

/**
 * @swagger
 *  /auth/login:
 *    post:
 *      summary: Login user
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - password
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rajid@example.com
 *                password:
 *                  type: string
 *                  example: Rajid@123
 *
 *      responses:
 *        200:
 *          description: User logged in successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Login success
 *                  accessToken:
 *                    type: string
 *                    example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNmZkYTQxOS0wNDk1LTQwNWQtYjU5Ny1iNjFlZjc4YzBiOWQiLCJyb2xlIjoiZW1wbG95ZXIiLCJpYXQiOjE3ODA0MDY4MDYsImV4cCI6MTc4MDQwNzcwNn0.KJ_HMzRqfUNrM8EYwdR0ewbq3EvXmpaYcZ6p34B6RVA
 *
 *        400:
 *          description: Validation failed
 *        401:
 *          description: Invalid email or password
 *        403:
 *          description: Please verify your email first
 */
router.post('/login', strictLimiter, validate(loginSchema), loginUser);

/**
 * @swagger
 *  /auth/logout:
 *    post:
 *      summary: Logout user
 *      tags:
 *        - Auth
 *      security:
 *        - bearerAuth: []
 *
 *      responses:
 *        200:
 *          description: User log out success
 *        500:
 *          description: Internal server error
 */
router.post('/logout', auth, logoutUser);

/**
 * @swagger
 *  /auth/refresh:
 *    get:
 *      summary: Refresh access token
 *      tags:
 *        - Auth
 *      responses:
 *        200:
 *          description: Refresh success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Refresh success
 *                  accessToken:
 *                    type: string
 *                    example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNmZkYTQxOS0wNDk1LTQwNWQtYjU5Ny1iNjFlZjc4YzBiOWQiLCJyb2xlIjoiZW1wbG95ZXIiLCJpYXQiOjE3ODA0MDY4MDYsImV4cCI6MTc4MDQwNzcwNn0.KJ_HMzRqfUNrM8EYwdR0ewbq3EvXmpaYcZ6p34B6RVA
 *
 *        401:
 *          description: Invalid or expired refresh token
 *        500:
 *          description: Internal server error
 */
router.get('/refresh', refreshAccessToken);

/**
 * @swagger
 *  /auth/forgot-password:
 *    post:
 *      summary: Forgot password
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rajid@example.com
 *
 *      responses:
 *        200:
 *          description: Check your email for otp
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Check your email for otp
 *
 *        500:
 *          description: Internal server error
 */
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), forgotUserPassword);

/**
 * @swagger
 *  /auth/verify-reset-otp:
 *    post:
 *      summary: Verify password reset otp
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - otp
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  example: rajid@example.com
 *                otp:
 *                  type: string
 *                  example: 123456
 *
 *      responses:
 *        200:
 *          description: Otp verified successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: otp verification success
 *
 *        400:
 *          description: Invalid or expired otp
 *        500:
 *          description: Internal server error
 */
router.post('/verify-reset-otp', strictLimiter, validate(verifyResetOtpSchema), verifyResetOtp);

/**
 * @swagger
 *  /auth/reset-password:
 *    patch:
 *      summary: Reset password
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *              properties:
 *                password:
 *                  type: string
 *                  example: Rajid@123
 *
 *      responses:
 *        200:
 *          description: Password reset successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Password reset success
 *
 *        401:
 *          description: Unauthorized access denied
 *        404:
 *          description: Invalid or expire reset token
 *        500:
 *          description: Internal server error
 */
router.patch('/reset-password', validate(resetPasswordSchema), resetUserPassword);

export default router;
