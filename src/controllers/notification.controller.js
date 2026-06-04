import pool from '../db/db.js';
import { getAllNotificationsSchema } from '../validators/notification.schema.js';

const getAllNotifications = async (req, res) => {
  try {
    const validatedQueries = getAllNotificationsSchema.safeParse(req.query);

    const { limit, page } = validatedQueries.data;

    const offset = (page - 1) * limit;

    const [notificationsResult, resultCountResult] = await Promise.all([
      pool.query(
        `
				SELECT id, application_id, type, message, seen, created_at
				FROM notifications WHERE user_id = $1
				ORDER BY created_at DESC
				LIMIT $2
				OFFSET $3
			`,
        [req.user.userId, limit, offset]
      ),

      pool.query(
        `
				SELECT COUNT(id) AS total
				FROM notifications WHERE user_id = $1
			`,
        [req.user.userId]
      ),
    ]);

    const notifications = notificationsResult.rows;

    const totalResult = Number(resultCountResult.rows[0].total);
    const totalPages = Math.ceil(totalResult / limit);

    res.status(200).json({
      pagination: {
        page: page,
        per_page: limit,
        total_result: totalResult,
        totalPages: totalPages,
        has_next_page: totalPages > page,
        has_prev_page: page > 1,
      },

      data: notifications,
    });
  } catch (err) {
    console.error(`Failed to fetch notifications`, err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// mark notification as seen
const markNotificationSeen = async (req, res) => {
  const notificationId = req.params?.id;

  try {
    const markSeenResult = await pool.query(
      `
				UPDATE notifications
				SET seen = true
				WHERE id = $1 AND user_id = $2
				RETURNING id, seen
			`,
      [notificationId, req.user.userId]
    );

    if (markSeenResult.rows.length === 0) {
      return res.status(200).json({ message: 'marked as seen' });
    }

    res.status(200).json(markSeenResult.rows[0]);
  } catch (err) {
    console.error(`Failed to mark notification as seen`, err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// mark all notifications as seen
const markAllNotificationsSeen = async (req, res) => {
  try {
    const markSeenResult = await pool.query(
      `
				UPDATE notifications
				SET seen = true
				WHERE seen = false AND user_id = $1
				RETURNING id, seen
			`,
      [req.user.userId]
    );

    if (markSeenResult.rows.length === 0) {
      return res.status(200).json({ message: 'No unseen notifications found' });
    }

    res.status(200).json(markSeenResult.rows);
  } catch (err) {
    console.error(`Failed to mark all seen`, err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// delete a notification
const deleteNotification = async (req, res) => {
  const notificationId = req.params?.id;

  try {
    const deleteNotificationResult = await pool.query(
      `
				DELETE FROM notifications
				WHERE id = $1 AND user_id = $2
				RETURNING id
			`,
      [notificationId, req.user.userId]
    );

    if (deleteNotificationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(`Failed to delete notification`, err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// delete all seen notifications
const deleteSeenNotifications = async (req, res) => {
  try {
    const deleteNotificationsResult = await pool.query(
      `
				DELETE FROM notifications
				WHERE seen = true AND user_id = $1
				RETURNING id
			`,
      [req.user.userId]
    );

    res
      .status(200)
      .json({
        message: 'Notifications deleted',
        deleted_count: deleteNotificationsResult.rows.length,
      });
  } catch (err) {
    console.error(`Failed to delete seen notifications`, err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// delete all notifications
const deleteAllNotifications = async (req, res) => {
  try {
    const deleteAllResult = await pool.query(
      `
				DELETE FROM notifications
				WHERE user_id = $1
				RETURNING id
			`,
      [req.user.userId]
    );

    res
      .status(200)
      .json({ message: 'Notifications deleted', deleted_count: deleteAllResult.rows.length });
  } catch (err) {
    console.error(`Failed to delete all notifications`, err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getAllNotifications,
  markNotificationSeen,
  markAllNotificationsSeen,
  deleteNotification,
  deleteSeenNotifications,
  deleteAllNotifications,
};
