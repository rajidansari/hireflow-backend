import { Router } from 'express';
import checkRole from '../middleware/role.middleware.js';
import auth from '../middleware/auth.middleware.js';
import {
  getCandidateProfile,
  updateCandidateProfile,
  updateCV,
} from '../controllers/candidate.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateCandidateProfileSchema } from '../validators/candidateProfile.schema.js';
import { upload } from '../services/fileUpload.service.service.js';

const router = Router();

router.get('/me', auth, checkRole(['candidate']), getCandidateProfile);
router.patch(
  '/me',
  auth,
  checkRole(['candidate']),
  validate(updateCandidateProfileSchema),
  updateCandidateProfile
);

// update cv
router.patch('/me/cv', auth, checkRole(['candidate']), upload.single('cv'), updateCV);

export default router;
