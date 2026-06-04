import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import {
  getAllNotifications,
  markNotificationSeen,
  markAllNotificationsSeen,
  deleteNotification,
  deleteSeenNotifications,
  deleteAllNotifications,
} from '../controllers/notification.controller.js';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags:
 *       - Notifications
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
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, getAllNotifications);

/**
 * @swagger
 * /notifications/seen:
 *   patch:
 *     summary: Mark all notifications as seen
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: All notifications marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   seen:
 *                     type: boolean
 *                     example: true
 *
 *       404:
 *         description: Notification not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch('/seen', auth, markAllNotificationsSeen);

/**
 * @swagger
 * /notifications/seen:
 *   delete:
 *     summary: Delete all seen notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Seen notifications deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications deleted
 *
 *                 deleted_count:
 *                   type: integer
 *                   example: 3
 *
 *       500:
 *         description: Internal server error
 */
router.delete('/seen', auth, deleteSeenNotifications);

/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Delete all notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Notifications deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications deleted
 *
 *                 deleted_count:
 *                   type: integer
 *                   example: 5
 *
 *       500:
 *         description: Internal server error
 */
router.delete('/', auth, deleteAllNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
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
 *         description: Notification ID
 *
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *
 *       404:
 *         description: Notification not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth, deleteNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Mark notification as seen
 *     tags:
 *       - Notifications
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
 *
 *     responses:
 *       200:
 *         description: Notification marked as seen
 *
 *       404:
 *         description: Notification not found
 */
router.patch('/:id', auth, markNotificationSeen);

export default router;
