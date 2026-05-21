import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import { getMyApplications, withdrawApplication } from '../controllers/application.controller.js';

const router = Router();

router.get('/my', auth, checkRole(['candidate']), getMyApplications);
router.delete('/:id', auth, checkRole(['candidate']), withdrawApplication);

export default router;
