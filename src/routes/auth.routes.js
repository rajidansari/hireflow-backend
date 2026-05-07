import { Router } from 'express';
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, verifyEmailSchema } from "../validators/auth.schema.js";
import { registerUserWithProfile, verifyUserEmail } from "../controllers/auth.controller.js"

const router = Router();

router.post('/register', validate(registerSchema), registerUserWithProfile);
router.patch('/verify-email', validate(verifyEmailSchema), verifyUserEmail);


export default router;