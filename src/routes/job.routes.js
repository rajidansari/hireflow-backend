import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import auth from '../middleware/auth.middleware.js';
import {
  createJobSchema,
  getAllJobSchema,
  updateJobDetailsSchema,
} from '../validators/job.schema.js';

import {
  createJob,
  getAllJob,
  getJobDetails,
  updateJobDetails,
  deleteJob,
  getMyJobs,
} from '../controllers/job.controller.js';
import checkRole from '../middleware/role.middleware.js';
import { applySchema } from '../validators/application.schema.js';
import { createJobApplication, getJobApplications } from '../controllers/application.controller.js';
import { upload } from '../services/fileUpload.service.service.js';

const router = Router();

/**
 * @swagger
 *  /jobs:
 *    post:
 *      summary: Create job
 *      tags:
 *        - Jobs
 *
 *      security:
 *        - bearerAuth: []
 *
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - title
 *                - description
 *                - skills
 *                - location
 *                - salary_min
 *                - salary_max
 *
 *              properties:
 *                title:
 *                  type: string
 *                  example: Software Engineer
 *
 *                description:
 *                  type: string
 *                  example: Looking for experienced software engineer
 *
 *                skills:
 *                  type: array
 *                  items:
 *                    type: string
 *                  example:
 *                    - PostgreSql
 *                    - Express
 *                    - Next.js
 *                    - Unit Testing
 *                    - Version Control
 *
 *                location:
 *                  type: string
 *                  example: Pune
 *
 *                salary_min:
 *                  type: integer
 *                  example: 800000
 *
 *                salary_max:
 *                  type: integer
 *                  example: 1200000
 *
 *      responses:
 *        201:
 *          description: Job created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Job created
 *
 *                  job:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        example: 1a2cbc1e-8dd5-4047-9c5a-128d87d0ddfe
 *
 *                      title:
 *                        type: string
 *                        example: Software Engineer
 *
 *        403:
 *          description: Unauthorized access
 *
 *        500:
 *          description: Internal server error
 */
router.post('/', auth, checkRole(['employer']), validate(createJobSchema), createJob);

/**
 * @swagger
 *  /jobs:
 *    get:
 *      summary: List all jobs
 *      tags:
 *        - Jobs
 *
 *      parameters:
 *        - in: query
 *          name: title
 *          schema:
 *            type: string
 *          description: Job title
 *          example: Software Engineer
 *
 *        - in: query
 *          name: location
 *          schema:
 *            type: string
 *          description: Job location
 *          example: Gurugram
 *
 *        - in: query
 *          name: skills
 *          schema:
 *            type: array
 *            items:
 *              type: string
 *            description: Filter jobs by skills
 *            example:
 *              - react
 *              - nodejs
 *              - mongodb
 *
 *        - in: query
 *          name: salary_min
 *          schema:
 *            type: integer
 *          description: Filter by minimum salary
 *          example: 800000
 *
 *        - in: query
 *          name: salary_max
 *          schema:
 *            type: integer
 *          description: Filter by maximum salary
 *          example: 1300000
 *
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *          example: 1
 *
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *          description: How many jobs you want to see in a page
 *          example: 20
 *
 *        - in: query
 *          name: sort
 *          schema:
 *            type: string
 *            enum:
 *              - newest
 *              - oldest
 *              - salary_high
 *              - salary_low
 *          example: newest
 *
 *      responses:
 *        200:
 *          description: Jobs fetched successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: success
 *
 *                  pagination:
 *                    type: object
 *                    properties:
 *                      page:
 *                        type: integer
 *                        example: 1
 *                      per_page:
 *                        type: integer
 *                        example: 15
 *                      total_pages:
 *                        type: integer
 *                        example: 1
 *                      total_results:
 *                        type: integer
 *                        example: 3
 *                      has_next_page:
 *                        type: boolean
 *                        example: false
 *                      has_prev_page:
 *                        type: boolean
 *                        example: false
 *
 *                  filters:
 *                    type: object
 *                    properties:
 *                      title:
 *                        type: string
 *                        nullable: true
 *                      location:
 *                        type: string
 *                        nullable: true
 *                      skills:
 *                        type: string
 *                        nullable: true
 *                      salary_min:
 *                        type: integer
 *                        nullable: true
 *                      salary_max:
 *                        type: integer
 *                        nullable: true
 *                      sort:
 *                        type: string
 *                        example: newest
 *
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: string
 *                          format: uuid
 *                          example: 1a2cbc1e-8dd5-4047-9c5a-128d87d0ddfe
 *
 *                        title:
 *                          type: string
 *                          example: Software Engineer
 *
 *                        skills:
 *                          type: array
 *                          items:
 *                            type: string
 *                          example:
 *                            - React
 *                            - Node
 *                            - Express
 *
 *                        salary_min:
 *                          type: integer
 *                          example: 45000
 *
 *                        salary_max:
 *                          type: integer
 *                          example: 60000
 *
 *                        location:
 *                          type: string
 *                          example: New Delhi
 *
 *                        employer_id:
 *                          type: string
 *                          format: uuid
 *                          example: 063802c0-7df8-45eb-9240-ac2eee6ce4af
 *
 *                        company_name:
 *                          type: string
 *                          example: Google
 *
 *        500:
 *          description: Internal server error
 */
router.get('/', getAllJob);

/**
 * @swagger
 *  /jobs/my-jobs:
 *    get:
 *      summary: employer's posted jobs
 *      tags:
 *        - Jobs
 *      security:
 *        - bearerAuth: []
 *
 *      responses:
 *        200:
 *          description: Successfully fetched employer's jobs
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: success
 *
 *                  data:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: string
 *
 *                        title:
 *                          type: string
 *
 *                        description:
 *                          type: string
 *
 *                        skills:
 *                          type: array
 *                          items:
 *                            type: string
 *                          example:
 *                            - Java
 *                            - React
 *                            - Nodejs
 *                            - PostgreSql
 *
 *                        location:
 *                          type: string
 *                          example: Gurugram
 *
 *                        salary_min:
 *                          type: integer
 *                          example: 900000
 *
 *                        salary_max:
 *                          type: integer
 *                          example: 1200000
 *
 *                        status:
 *                          type: string
 *                          enum:
 *                            - draft
 *                            - active
 *                            - expired
 *                          example: active
 *
 *                        created_at:
 *                          type: string
 *                          format: date
 *        403:
 *          description: Unauthorized access
 *
 *        500:
 *          description: Internal server error
 *
 */
router.get('/my-jobs', auth, checkRole(['employer']), getMyJobs);

/**
 * @swagger
 *  /jobs/{id}:
 *    get:
 *      summary: get a specific job
 *      tags:
 *        - Jobs
 *
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *            format: uuid
 *          description: Job ID
 *
 *      responses:
 *        200:
 *          description: Successfully fetched job details
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  title:
 *                    type: string
 *                  description:
 *                    type: string
 *                  skills:
 *                    type: array
 *                    items:
 *                      type: string
 *                  location:
 *                    type: string
 *                  salary_min:
 *                    type: integer
 *                  salary_max:
 *                    type: integer
 *                  status:
 *                    type: string
 *                    enum:
 *                      - draft
 *                      - active
 *                      - expired
 *                  created_at:
 *                    type: string
 *                  employer_id:
 *                    type: string
 *                  employer_name:
 *                    type: string
 *                  logo_url:
 *                    type: string
 *                  website:
 *                    type: string
 *
 *        404:
 *          description: Job not found
 *        500:
 *          description: Internal server error
 */
router.get('/:id', getJobDetails);

/**
 * @swagger
 * /jobs/{id}:
 *   patch:
 *     summary: Update job details
 *     tags:
 *       - Jobs
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
 *         description: Job ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               salary_min:
 *                 type: integer
 *               salary_max:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum:
 *                   - open
 *                   - closed
 *
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     location:
 *                       type: string
 *                     salary_min:
 *                       type: integer
 *                     salary_max:
 *                       type: integer
 *                     status:
 *                       type: string
 *
 *       400:
 *         description: Nothing to update
 *
 *       403:
 *         description: Can not perform this task
 *
 *       404:
 *         description: Requested job not found
 */
router.patch(
  '/:id',
  auth,
  checkRole(['employer']),
  validate(updateJobDetailsSchema),
  updateJobDetails
);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags:
 *       - Jobs
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
 *         description: Job ID
 *
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *
 *       403:
 *         description: You can not perform this action
 *
 *       404:
 *         description: Requested job not found
 */
router.delete('/:id', auth, checkRole(['employer']), deleteJob);

// applications

/**
 * @swagger
 *  /jobs/{jobId}/applications:
 *    post:
 *      summary: Create application for job
 *      tags:
 *        - Applications
 *      security:
 *        - bearerAuth: []
 *
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                coverNote:
 *                  type: string
 *
 *      parameters:
 *        - in: path
 *          name: jobId
 *          required: true
 *          schema:
 *            type: string
 *            format: uuid
 *          description: Job id
 *
 *      responses:
 *        201:
 *          description: Application submitted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    format: uuid
 *
 *                  job_id:
 *                    type: string
 *                    format: uuid
 *
 *                  candidate_id:
 *                    type: string
 *                    format: uuid
 *
 *                  cv_url:
 *                    type: string
 *
 *                  status:
 *                    type: string
 *                    enum:
 *                      - pending
 *                      - reviewed
 *                      - hired
 *                      - rejected
 *
 *                  cover_note:
 *                    type: string
 *
 *                  applied_at:
 *                    type: string
 *                    format: date-time
 *                    example: 2026-05-20T18:31:03.000Z
 *
 *        400:
 *          description: CV not uploaded
 *
 *        403:
 *          description: Unauthorized access
 *
 *        409:
 *          description: Already applied
 *
 *        500:
 *          description: Internal server error
 */
router.post(
  '/:jobId/applications',
  auth,
  checkRole(['candidate']),
  upload.single('cv'),
  validate(applySchema),
  createJobApplication
);

/**
 * @swagger
 * /jobs/{jobId}/applications:
 *   get:
 *     summary: Get applications for a specific job
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID
 *
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
 *             - reviewed
 *             - hired
 *             - rejected
 *         description: Filter applications by status
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
router.get('/:jobId/applications', auth, checkRole(['employer']), getJobApplications);

export default router;
