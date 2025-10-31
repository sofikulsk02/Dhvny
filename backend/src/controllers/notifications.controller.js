import Notification from "../models/Notification.model.js";

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const query = { recipient: req.user._id };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("sender", "username displayName avatarUrl")
      .populate("relatedSong", "title coverUrl")
      .populate("relatedPlaylist", "name coverUrl")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error counting notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log(
      "🔔 Marking notification as read:",
      notificationId,
      "for user:",
      req.user._id
    );

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      console.log("❌ Notification not found:", notificationId);
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();
    console.log("✅ Notification marked as read:", notificationId);

    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await notification.deleteOne();

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });

    res.json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Helper function to create a notification
 * This is used by other controllers to create notifications
 */
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    await notification.populate("sender", "username displayName avatarUrl");
    await notification.populate("relatedSong", "title coverUrl");
    await notification.populate("relatedPlaylist", "name coverUrl");
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Helper function to emit notification via Socket.IO
 */
export const emitNotification = (io, userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
};
