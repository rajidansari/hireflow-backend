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

router.post('/register', standardLimiter, validate(registerSchema), registerUserWithProfile);
router.patch('/verify-email', standardLimiter, validate(verifyEmailSchema), verifyUserEmail);
router.post('/login', strictLimiter, validate(loginSchema), loginUser);
router.post('/logout', auth, logoutUser);
router.get('/refresh', refreshAccessToken);
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), forgotUserPassword);
router.post('/verify-reset-otp', strictLimiter, validate(verifyResetOtpSchema), verifyResetOtp);
router.patch('/reset-password', validate(resetPasswordSchema), resetUserPassword);

export default router;
