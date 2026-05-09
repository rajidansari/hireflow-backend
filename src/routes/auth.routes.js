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

const router = Router();

router.post('/register', validate(registerSchema), registerUserWithProfile);
router.patch('/verify-email', validate(verifyEmailSchema), verifyUserEmail);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', auth, logoutUser);
router.get('/refresh', refreshAccessToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotUserPassword);
router.post('/verify-reset-otp', validate(verifyResetOtpSchema), verifyResetOtp);
router.patch('/reset-password', validate(resetPasswordSchema), resetUserPassword);

export default router;
