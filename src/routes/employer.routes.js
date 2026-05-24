import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import {
  getEmployerProfile,
  updateEmployerProfile,
  updateLogo,
} from '../controllers/employer.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateEmployerProfileSchema } from '../validators/employerProfile.schema.js';
import { imageUpload } from '../services/fileUpload.service.service.js';

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

// update logo
router.patch('/me/logo', auth, checkRole(['employer']), imageUpload.single('logo'), updateLogo);

export default router;
