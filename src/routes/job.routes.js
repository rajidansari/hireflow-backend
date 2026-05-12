import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import auth from '../middleware/auth.middleware.js';
import { createJobSchema, getAllJobSchema } from '../validators/job.schema.js';
import { createJob, getAllJob } from '../controllers/job.controller.js';
import checkRole from '../middleware/role.middleware.js';

const router = Router();

router.post('/', auth, checkRole(['employer']), validate(createJobSchema), createJob);
router.get('/', getAllJob);

export default router;
