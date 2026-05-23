import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import { getEmployerProfile, updateEmployerProfile } from '../controllers/employer.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateEmployerProfileSchema } from '../validators/employerProfile.schema.js';

const router = Router();

router.get('/me', auth, checkRole(['employer']), getEmployerProfile);

// update profile
router.patch(
  '/me',
  auth,
  checkRole(['employer']),
  validate(updateEmployerProfileSchema),
  updateEmployerProfile
);

export default router;
