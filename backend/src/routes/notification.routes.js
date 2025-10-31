import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notifications.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's notifications with pagination and filtering
router.get("/", getNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Mark a single notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read
router.put("/read-all", markAllAsRead);

// Delete a single notification
router.delete("/:id", deleteNotification);

// Delete all notifications
router.delete("/", deleteAllNotifications);

export default router;
