const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create notification
exports.createNotification = async (userId, type, title, message, referenceId = null, referenceType = null, senderId = null, senderRole = null) => {
  try {
    let senderName = null;
    
    // Get sender information if provided
    if (senderId) {
      const sender = await User.findById(senderId);
      if (sender) {
        senderName = sender.name;
      }
    }

    const notification = new Notification({
      user: userId,
      sender: senderId,
      senderName,
      senderRole,
      type,
      title,
      message,
      referenceId,
      referenceType
    });

    await notification.save();

    // Emit real-time notification if socket is available
    if (global.io) {
      global.io.to(userId.toString()).emit('notification', {
        id: notification._id,
        sender: senderId,
        senderName,
        senderRole,
        type,
        title,
        message,
        referenceId,
        referenceType,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification (for testing)
exports.createNotificationAPI = async (req, res) => {
  try {
    console.log('🔍 DEBUG: createNotificationAPI called');
    console.log('🔍 DEBUG: req.body =', JSON.stringify(req.body, null, 2));
    
    const { user, type, title, message, referenceId, referenceType, senderId, senderRole } = req.body;

    // Debug referenceId extraction
    console.log('🔍 DEBUG: Extracted referenceId =', referenceId);
    console.log('🔍 DEBUG: typeof referenceId =', typeof referenceId);
    console.log('🔍 DEBUG: referenceId length =', referenceId ? referenceId.length : 'undefined');
    
    // Validate required fields
    if (!user || !type || !title || !message) {
      console.log('🔍 DEBUG: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'User, type, title, and message are required'
      });
    }

    // Validate type
    const validTypes = ['request', 'message', 'status', 'order'];
    if (!validTypes.includes(type)) {
      console.log('🔍 DEBUG: Invalid type:', type);
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: request, message, status, order'
      });
    }

    // Convert referenceId to ObjectId if provided
    let referenceObjectId = null;
    if (referenceId) {
      // Clean the referenceId
      let cleanedReferenceId = referenceId?.toString().trim();
      console.log('🔍 DEBUG: Cleaned referenceId =', cleanedReferenceId);
      console.log('🔍 DEBUG: Cleaned referenceId length =', cleanedReferenceId.length);
      
      // Check if it's a valid ObjectId format
      const isValidObjectId = mongoose.Types.ObjectId.isValid(cleanedReferenceId);
      console.log('🔍 DEBUG: mongoose.Types.ObjectId.isValid(cleanedReferenceId) =', isValidObjectId);
      
      // Additional manual validation for debugging
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      const matchesPattern = objectIdPattern.test(cleanedReferenceId);
      console.log('🔍 DEBUG: ObjectId pattern match =', matchesPattern);
      
      if (!isValidObjectId || !matchesPattern) {
        console.log('🔍 DEBUG: Invalid ObjectId detected');
        return res.status(400).json({
          success: false,
          message: 'Invalid referenceId format. Must be a valid 24-character hexadecimal ObjectId',
          debug: {
            original: referenceId,
            cleaned: cleanedReferenceId,
            type: typeof cleanedReferenceId,
            length: cleanedReferenceId.length,
            isValidObjectId,
            matchesPattern
          }
        });
      }
      
      // Create ObjectId instance
      try {
        referenceObjectId = new mongoose.Types.ObjectId(cleanedReferenceId);
        console.log('🔍 DEBUG: Successfully created ObjectId:', referenceObjectId.toString());
      } catch (error) {
        console.log('🔍 DEBUG: Error creating ObjectId:', error.message);
        return res.status(400).json({
          success: false,
          message: 'Failed to create ObjectId from referenceId',
          error: error.message,
          debug: {
            referenceId: cleanedReferenceId
          }
        });
      }
    } else {
      console.log('🔍 DEBUG: No referenceId provided (optional field)');
    }

    console.log('🔍 DEBUG: Creating notification with data:', {
      user,
      sender: senderId,
      senderName: req.body.senderName,
      senderRole,
      type,
      title,
      message,
      referenceId: referenceObjectId,
      referenceType
    });

    const notification = new Notification({
      user,
      sender: senderId,
      senderName: req.body.senderName,
      senderRole,
      type,
      title,
      message,
      referenceId: referenceObjectId,
      referenceType
    });

    await notification.save();
    console.log('🔍 DEBUG: Notification saved successfully:', notification._id);

    // Emit real-time notification if socket is available
    if (global.io) {
      global.io.to(user.toString()).emit('notification', {
        id: notification._id,
        sender: senderId,
        senderName: req.body.senderName,
        senderRole,
        type,
        title,
        message,
        referenceId: referenceObjectId,
        referenceType,
        createdAt: notification.createdAt
      });
      console.log('🔍 DEBUG: Socket notification emitted');
    }

    console.log('🔍 DEBUG: Returning success response');
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('🔍 DEBUG: Error in createNotificationAPI:', error);
    console.error('🔍 DEBUG: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
      debug: {
        errorName: error.name,
        errorMessage: error.message
      }
    });
  }
};

// Get sample data for testing
exports.getSampleData = async (req, res) => {
  try {
    const Request = require('../models/Request');
    const Chat = require('../models/Chat');
    const Order = require('../models/Order');
    const Listing = require('../models/Listing');

    const requests = await Request.find().limit(3).select('_id title');
    const chats = await Chat.find().limit(3).select('_id participants');
    const orders = await Order.find().limit(3).select('_id orderId');
    const listings = await Listing.find().limit(3).select('_id title');

    res.json({
      success: true,
      data: {
        requests,
        chats,
        orders,
        listings
      }
    });
  } catch (error) {
    console.error('Error getting sample data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sample data',
      error: error.message
    });
  }
};

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('referenceId', 'title');

    const totalCount = await Notification.countDocuments({ user: userId });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      unreadCount: await Notification.countDocuments({ user: userId, isRead: false })
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};
