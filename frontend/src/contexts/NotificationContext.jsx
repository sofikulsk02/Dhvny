import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "../hooks/useAuth";
import * as notificationsApi from "../api/notifications.api";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
      if (!user) return;

      try {
        setLoading(true);
        console.log("🔔 Fetching notifications for user:", user._id);
        const response = await notificationsApi.getNotifications({
          page,
          limit,
          unreadOnly,
        });
        console.log("🔔 Notification API response:", response);
        if (response.success) {
          console.log(
            "✅ Got notifications:",
            response.notifications?.length || 0,
            "| Unread:",
            response.unreadCount
          );
          setNotifications(response.notifications || []);
          setUnreadCount(response.unreadCount || 0); // ✅ Update unread count from response
        } else {
          console.error("❌ Notification fetch failed:", response);
        }
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationsApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await notificationsApi.markAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return response;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationsApi.markAllAsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
      return response;
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      throw error;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await notificationsApi.deleteNotification(
        notificationId
      );
      if (response.success) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        // Also update unread count if it was unread
        setNotifications((prev) => {
          const deleted = prev.find((n) => n._id === notificationId);
          if (deleted && !deleted.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev.filter((n) => n._id !== notificationId);
        });
      }
      return response;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  }, []);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
      return response;
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      throw error;
    }
  }, []);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (!socket || !user) return;

    // Handler for new notification
    const handleNewNotification = (notification) => {
      console.log("New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Handler for notification marked as read
    const handleMarkedRead = ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    };

    socket.on("notification", handleNewNotification);
    socket.on("notification:marked_read", handleMarkedRead);

    return () => {
      socket.off("notification", handleNewNotification);
      socket.off("notification:marked_read", handleMarkedRead);
    };
  }, [socket, user]);

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      console.log(
        "🔔 NotificationContext: Fetching notifications for user:",
        user._id
      );
      fetchNotifications();
      fetchUnreadCount();
    } else {
      console.log("🔔 NotificationContext: No user logged in");
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
