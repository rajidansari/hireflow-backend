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

/**
 * @swagger
 *  /candidates/me:
 *    get:
 *      summary: Get candidate profile details
 *      tags:
 *        - Profile
 *      security:
 *        - bearerAuth: []
 * 
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  fullname:
 *                    type: string
 * 
 *                  email:
 *                    type: string
 *                    format: email
 * 
 *                  headline:
 *                    type: string
 * 
 *                  description:
 *                    type: string
 * 
 *                  skills:
 *                    type: array
 *                    items:
 *                      type: string
 * 
 *                  location:
 *                    type: string
 * 
 *                  default_cv_url:
 *                    type: string
 * 
 *                  portfolio_url:
 *                    type: string
 * 
 *        404:
 *          description: Profile not found
 *        
 *        500:
 *          description: Internal server error
 */
router.get('/me', auth, checkRole(['candidate']), getCandidateProfile);

/**
 * @swagger
 * /candidates/me:
 *   patch:
 *     summary: Update candidate profile
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Rajid Ansari
 *
 *               headline:
 *                 type: string
 *                 example: Full Stack Developer
 *
 *               description:
 *                 type: string
 *                 example: Passionate full-stack developer with experience in React and Node.js.
 *
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - React
 *                   - Node.js
 *                   - PostgreSQL
 *
 *               location:
 *                 type: string
 *                 example: New Delhi
 *
 *               portfolioUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://rajid.dev
 *
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullname:
 *                   type: string
 *
 *                 headline:
 *                   type: string
 *
 *                 description:
 *                   type: string
 *
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *
 *                 location:
 *                   type: string
 *
 *                 portfolio_url:
 *                   type: string
 *
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *
 *       400:
 *         description: No fields provided for update
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/me',
  auth,
  checkRole(['candidate']),
  validate(updateCandidateProfileSchema),
  updateCandidateProfile
);

/**
 * @swagger
 * /candidates/me/cv:
 *   patch:
 *     summary: Update candidate CV
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: PDF file only, maximum size 3 MB
 *
 *     responses:
 *       200:
 *         description: CV updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 default_cv_url:
 *                   type: string
 *                   format: uri
 *                   example: https://res.cloudinary.com/demo/raw/upload/v123456/candidates_cvs/resume.pdf
 *
 *       400:
 *         description: CV file is required or file validation failed
 *
 *       500:
 *         description: Internal server error
 */
router.patch('/me/cv', auth, checkRole(['candidate']), upload.single('cv'), updateCV);

export default router;
