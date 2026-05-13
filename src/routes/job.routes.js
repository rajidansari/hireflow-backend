import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import auth from '../middleware/auth.middleware.js';
import {
  createJobSchema,
  getAllJobSchema,
  updateJobDetailsSchema,
} from '../validators/job.schema.js';

import {
  createJob,
  getAllJob,
  getJobDetails,
  updateJobDetails,
  deleteJob,
  getMyJobs,
} from '../controllers/job.controller.js';
import checkRole from '../middleware/role.middleware.js';

const router = Router();

router.post('/', auth, checkRole(['employer']), validate(createJobSchema), createJob);
router.get('/', getAllJob);
router.get('/my-jobs', auth, checkRole(['employer']), getMyJobs);
router.get('/:id', getJobDetails);
router.patch(
  '/:id',
  auth,
  checkRole(['employer']),
  validate(updateJobDetailsSchema),
  updateJobDetails
);

router.delete('/:id', auth, checkRole(['employer']), deleteJob);

export default router;
