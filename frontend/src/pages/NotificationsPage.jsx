import React, { useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Music,
  Trophy,
  Share2,
  Trash2,
  CheckCheck,
} from "lucide-react";

/**
 * NotificationsPage - Real-time notifications with Socket.IO
 * Displays notifications from backend with type-specific icons and actions
 */

const getNotificationIcon = (type) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "comment_reply":
    case "comment_like":
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case "friend_request":
      return <UserPlus className="w-5 h-5 text-purple-500" />;
    case "friend_accept":
      return <UserCheck className="w-5 h-5 text-green-500" />;
    case "friend_reject":
      return <UserX className="w-5 h-5 text-gray-500" />;
    case "new_song":
      return <Music className="w-5 h-5 text-indigo-500" />;
    case "legend_promotion":
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case "song_share":
      return <Share2 className="w-5 h-5 text-teal-500" />;
    default:
      return <MessageCircle className="w-5 h-5 text-gray-500" />;
  }
};

const timeAgo = (date) => {
  const now = Date.now();
  const timestamp = new Date(date).getTime();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    console.log("🔔 Notification clicked:", notification);

    // Mark as read
    if (!notification.isRead) {
      console.log("🔔 Marking as read:", notification._id);
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error("❌ Failed to mark as read:", error);
        // Continue anyway - still navigate to the link
      }
    }

    // Navigate to the link if available
    if (notification.link) {
      console.log("🔔 Navigating to:", notification.link);
      navigate(notification.link);
    } else {
      console.log("⚠️ No link in notification");
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      try {
        await deleteAllNotifications();
      } catch (error) {
        console.error("Failed to delete all notifications:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm text-gray-500">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  notification.isRead
                    ? "border border-gray-200"
                    : "border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50"
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Sender Avatar & Name */}
                    {notification.sender && (
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={
                            notification.sender.avatar || "/default-avatar.png"
                          }
                          alt={notification.sender.displayName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          {notification.sender.displayName}
                        </span>
                      </div>
                    )}

                    {/* Notification Text */}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {notification.content}
                    </p>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-1">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, notification._id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Unread Indicator Dot */}
                {!notification.isRead && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-purple-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
