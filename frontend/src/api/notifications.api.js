import api from "./client.js";

/**
 * Get all notifications for the current user
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @param {boolean} params.unreadOnly - Filter unread notifications only
 * @returns {Promise<{success: boolean, notifications: Array, pagination: Object}>}
 */
export const getNotifications = async ({
  page = 1,
  limit = 20,
  unreadOnly = false,
} = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (unreadOnly) {
    params.append("unreadOnly", "true");
  }
  return api.get(`/notifications?${params.toString()}`);
};

/**
 * Get unread notification count
 * @returns {Promise<{success: boolean, count: number}>}
 */
export const getUnreadCount = async () => {
  return api.get("/notifications/unread-count");
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markAsRead = async (notificationId) => {
  return api.put(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markAllAsRead = async () => {
  return api.put("/notifications/read-all");
};

/**
 * Delete a notification
 * @param {string} notificationId - ID of the notification
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteNotification = async (notificationId) => {
  return api.del(`/notifications/${notificationId}`);
};

/**
 * Delete all notifications
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteAllNotifications = async () => {
  return api.del("/notifications");
};
