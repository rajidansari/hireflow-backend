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

/**
 * @swagger
 * /applications/me:
 *   get:
 *     summary: Get my job applications
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - shortlisted
 *             - rejected
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - newest
 *             - oldest
 *         example: newest
 *
 *     responses:
 *       200:
 *         description: Applications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *
 *                 filters:
 *                   type: object
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *
 *                       job_id:
 *                         type: string
 *                         format: uuid
 *
 *                       candidate_id:
 *                         type: string
 *                         format: uuid
 *
 *                       cv_url:
 *                         type: string
 *
 *                       status:
 *                         type: string
 *
 *                       cover_note:
 *                         type: string
 *
 *                       applied_at:
 *                         type: string
 *                         format: date-time
 *
 *       403:
 *         description: Unauthorized access denied
 */
router.get('/my', auth, checkRole(['candidate']), getMyApplications);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Withdraw a job application
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *
 *       403:
 *         description: Unauthorized access denied
 *
 *       404:
 *         description: Application not found
 */
router.delete('/:id', auth, checkRole(['candidate']), withdrawApplication);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - reviewed
 *                   - hired
 *                   - rejected
 *                 example: hired
 *
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Updated successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *
 *                     status:
 *                       type: string
 *                       example: shortlisted
 *
 *                     job_id:
 *                       type: string
 *                       format: uuid
 *
 *                     candidate_id:
 *                       type: string
 *                       format: uuid
 *
 *       400:
 *         description: Application is already in the requested status
 *
 *       404:
 *         description: Application not found
 */
router.patch(
  '/:id',
  auth,
  checkRole(['employer']),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;
