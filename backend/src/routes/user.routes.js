import express from "express";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  getUserProfile,
  getUserProfileByUsername,
  updateProfile,
  updatePrivacySettings,
  updateNotificationSettings,
  updatePlaybackSettings,
  updateAppearanceSettings,
  getUserUploads,
  getUserLikes,
  getUserPlaylists,
  deleteAccount,
  uploadAvatar,
} from "../controllers/user.controller.js";
import multer from "multer";
import path from "path";

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "avatar-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

const router = express.Router();

/**
 * @route   GET /api/users/search
 * @desc    Search for users
 * @access  Private
 */
router.get("/search", protect, searchUsers);

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private
 */
router.put("/profile", protect, updateProfile);

/**
 * @route   PUT /api/users/avatar
 * @desc    Upload/update user avatar
 * @access  Private
 */
router.put("/avatar", protect, upload.single("avatar"), uploadAvatar);

/**
 * @route   GET /api/users/profile/:username
 * @desc    Get user profile by username
 * @access  Public
 */
router.get("/profile/:username", optionalAuth, getUserProfileByUsername);

/**
 * @route   PUT /api/users/settings/privacy
 * @desc    Update privacy settings
 * @access  Private
 */
router.put("/settings/privacy", protect, updatePrivacySettings);

/**
 * @route   PUT /api/users/settings/notifications
 * @desc    Update notification settings
 * @access  Private
 */
router.put("/settings/notifications", protect, updateNotificationSettings);

/**
 * @route   PUT /api/users/settings/playback
 * @desc    Update playback settings
 * @access  Private
 */
router.put("/settings/playback", protect, updatePlaybackSettings);

/**
 * @route   PUT /api/users/settings/appearance
 * @desc    Update appearance settings
 * @access  Private
 */
router.put("/settings/appearance", protect, updateAppearanceSettings);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete("/account", protect, deleteAccount);

/**
 * @route   GET /api/users/:userId/uploads
 * @desc    Get user's uploaded songs
 * @access  Public
 */
router.get("/:userId/uploads", optionalAuth, getUserUploads);

/**
 * @route   GET /api/users/:userId/likes
 * @desc    Get user's liked songs
 * @access  Public
 */
router.get("/:userId/likes", optionalAuth, getUserLikes);

/**
 * @route   GET /api/users/:userId/playlists
 * @desc    Get user's playlists
 * @access  Public
 */
router.get("/:userId/playlists", optionalAuth, getUserPlaylists);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get("/:userId", optionalAuth, getUserProfile);

export default router;
