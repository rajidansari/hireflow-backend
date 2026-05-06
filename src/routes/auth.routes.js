import { Router } from 'express';
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validators/auth.schema.js";
import { registerUserWithProfile } from "../controllers/auth.controller.js"

const router = Router();

router.post('/register', validate(registerSchema), registerUserWithProfile);


export default router;