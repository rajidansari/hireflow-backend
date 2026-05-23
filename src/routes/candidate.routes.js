import { Router } from 'express';
import checkRole from '../middleware/role.middleware.js';
import auth from '../middleware/auth.middleware.js';
import {
  getCandidateProfile,
  updateCandidateProfile,
} from '../controllers/candidate.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateCandidateProfileSchema } from '../validators/candidateProfile.schema.js';

const router = Router();

router.get('/me', auth, checkRole(['candidate']), getCandidateProfile);
router.patch(
  '/me',
  auth,
  checkRole(['candidate']),
  validate(updateCandidateProfileSchema),
  updateCandidateProfile
);

export default router;
