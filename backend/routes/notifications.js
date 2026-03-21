const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Import controller
const {
  createNotificationAPI,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getSampleData
} = require('../controllers/notificationController');

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/notifications
// @desc    Create notification (for testing)
// @access  Private
router.post('/', createNotificationAPI);

// @route   GET /api/notifications/sample
// @desc    Get sample data for testing
// @access  Private
router.get('/sample', getSampleData);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread
// @desc    Get unread count
// @access  Private
router.get('/unread', getUnreadCount);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', deleteNotification);

module.exports = router;
