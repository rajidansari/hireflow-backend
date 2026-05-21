import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import {
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateApplicationStatusSchema } from '../validators/application.schema.js';

const router = Router();

router.get('/my', auth, checkRole(['candidate']), getMyApplications);
router.delete('/:id', auth, checkRole(['candidate']), withdrawApplication);
router.patch(
  '/:id',
  auth,
  checkRole(['employer']),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;
