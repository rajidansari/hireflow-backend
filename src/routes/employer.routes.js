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

/**
 * @swagger
 * /employers/me:
 *   get:
 *     summary: Get employer profile
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Employer profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullname:
 *                   type: string
 *                   example: John Doe
 *
 *                 company_name:
 *                   type: string
 *                   example: Microsoft
 *
 *                 logo_url:
 *                   type: string
 *                   format: uri
 *                   example: https://example.com/logo.png
 *
 *                 website:
 *                   type: string
 *                   format: uri
 *                   example: https://microsoft.com
 *
 *                 industry:
 *                   type: string
 *                   example: Technology
 *
 *                 bio:
 *                   type: string
 *                   example: We build software products used worldwide.
 *
 *                 location:
 *                   type: string
 *                   example: Bengaluru, India
 *
 *       404:
 *         description: Profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get('/me', auth, checkRole(['employer']), getEmployerProfile);

/**
 * @swagger
 * /employers/me:
 *   patch:
 *     summary: Update employer profile
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
 *               companyName:
 *                 type: string
 *                 example: Microsoft
 *
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: https://microsoft.com
 *
 *               industry:
 *                 type: string
 *                 example: Technology
 *
 *               bio:
 *                 type: string
 *                 example: We build software products used worldwide.
 *
 *               location:
 *                 type: string
 *                 example: Bengaluru, India
 *
 *     responses:
 *       200:
 *         description: Employer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullname:
 *                   type: string
 *                   example: Rajid Ansari
 *
 *                 company_name:
 *                   type: string
 *                   example: Microsoft
 *
 *                 website:
 *                   type: string
 *                   format: uri
 *                   example: https://microsoft.com
 *
 *                 industry:
 *                   type: string
 *                   example: Technology
 *
 *                 bio:
 *                   type: string
 *                   example: We build software products used worldwide.
 *
 *                 location:
 *                   type: string
 *                   example: Bengaluru, India
 *
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-05-21T18:30:00Z
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
  checkRole(['employer']),
  validate(updateEmployerProfileSchema),
  updateEmployerProfile
);

/**
 * @swagger
 * /employers/me/logo:
 *   patch:
 *     summary: Update employer company logo
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
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo (PNG, JPEG, WEBP), maximum size 2 MB
 *
 *     responses:
 *       200:
 *         description: Logo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logo_url:
 *                   type: string
 *                   format: uri
 *                   example: https://res.cloudinary.com/demo/image/upload/v123456/employers-logo/logo.webp
 *
 *       400:
 *         description: Logo file is required or file validation failed
 *
 *       500:
 *         description: Internal server error
 */
router.patch('/me/logo', auth, checkRole(['employer']), imageUpload.single('logo'), updateLogo);

export default router;
