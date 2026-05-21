import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import checkRole from '../middleware/role.middleware.js';
import { getMyApplications } from '../controllers/application.controller.js';

const router = Router();

router.get('/my', auth, checkRole(['candidate']), getMyApplications);

export default router;
