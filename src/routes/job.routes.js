import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import auth from '../middleware/auth.middleware.js';
import { createJobSchema, getAllJobSchema } from '../validators/job.schema.js';
import { createJob, getAllJob, getJobDetails } from '../controllers/job.controller.js';
import checkRole from '../middleware/role.middleware.js';

const router = Router();

router.post('/', auth, checkRole(['employer']), validate(createJobSchema), createJob);
router.get('/', getAllJob);
router.get('/:id', getJobDetails);

export default router;
