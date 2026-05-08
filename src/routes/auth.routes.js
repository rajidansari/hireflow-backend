import { Router } from 'express';
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, verifyEmailSchema, loginSchema } from "../validators/auth.schema.js";
import { registerUserWithProfile, verifyUserEmail, loginUser, logoutUser } from "../controllers/auth.controller.js"
import auth from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), registerUserWithProfile);
router.patch('/verify-email', validate(verifyEmailSchema), verifyUserEmail);
router.post('/login', validate(loginSchema), loginUser)
router.post('/logout', auth, logoutUser)


export default router;