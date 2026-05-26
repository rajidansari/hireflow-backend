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

// get all notification
router.get('/', auth, getAllNotifications);

// mark all notifications as seen
router.patch('/seen', auth, markAllNotificationsSeen);

// delete only seen notifications
router.delete('/seen', auth, deleteSeenNotifications);

// delete all notifications
router.delete('/', auth, deleteAllNotifications);

// delete a specific notification
router.delete('/:id', auth, deleteNotification);

// mark a specific notification as seen
router.patch('/:id', auth, markNotificationSeen);

export default router;
