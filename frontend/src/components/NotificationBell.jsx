import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Reusable function for dynamic navigation based on reference
  const handleNotificationClick = (notification) => {
    console.log('🔗 Notification clicked:', notification);
    
    // Mark notification as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Dynamic navigation based on referenceType and referenceId
    if (notification.referenceId && notification.referenceType) {
      const { referenceType, referenceId } = notification;
      
      console.log('🔗 Navigating to:', { referenceType, referenceId });
      
      switch (referenceType) {
        case 'chat':
          console.log('🔗 Navigating to chat:', `/chat/${referenceId}`);
          navigate(`/chat/${referenceId}`);
          break;
        case 'order':
          console.log('🔗 Navigating to order:', `/orders/${referenceId}`);
          navigate(`/orders/${referenceId}`);
          break;
        case 'listing':
          console.log('🔗 Navigating to listing:', `/listing/${referenceId}`);
          navigate(`/listing/${referenceId}`);
          break;
        case 'request':
          console.log('🔗 Navigating to request:', `/requests/${referenceId}`);
          navigate(`/requests/${referenceId}`);
          break;
        default:
          console.warn(`Unknown referenceType: ${referenceType}`);
      }
    } else {
      console.log('🔗 No navigation data available');
    }
    
    // Close dropdown after navigation
    setIsOpen(false);
  };

  // Group notifications by time (Today, Yesterday, Earlier)
  const groupNotificationsByTime = (notifications) => {
    const groups = { today: [], yesterday: [], earlier: [] };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      
      if (notificationDate >= today) {
        groups.today.push(notification);
      } else if (notificationDate >= yesterday && notificationDate < today) {
        groups.yesterday.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });
    
    return groups;
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request':
        return '📋';
      case 'message':
        return '💬';
      case 'status':
        return '📊';
      case 'order':
        return '🛒';
      default:
        return '🔔';
    }
  };

  // Format time relative to now
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      if (notifications.find(n => n._id === notificationId && !n.isRead)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Render notification group with header
  const renderNotificationGroup = (title, notifications) => {
    if (notifications.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
          {title}
        </h4>
        {notifications.map((notification) => (
          <div 
            key={notification._id}
            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
              !notification.isRead ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">
                    {getNotificationIcon(notification.type)}
                  </span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  {notification.message}
                </p>
                {notification.senderName && (
                  <p className="text-xs text-gray-500 mb-1">
                    From: <span className="font-medium">{notification.senderName}</span> 
                    <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {notification.senderRole}
                    </span>
                  </p>
                )}
                <p className="text-gray-400 text-xs">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5002');
    
    // Join user's notification room
    socket.emit('join', user.id);
    
    // Listen for real-time notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Fetch initial notifications
    fetchNotifications();

    // Close socket on unmount
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const groupedNotifications = groupNotificationsByTime(notifications);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300 text-5xl mb-3">🔔</div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-1">You'll see updates here</p>
              </div>
            ) : (
              <>
                {renderNotificationGroup('Today', groupedNotifications.today)}
                {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
                {renderNotificationGroup('Earlier', groupedNotifications.earlier)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
