import User from "../models/User.model.js";
import Song from "../models/Song.model.js";
import Playlist from "../models/Playlist.model.js";
import {
  uploadImageToCloudinary,
  isCloudinaryConfigured,
} from "../utils/cloudinary.utils.js";
import fs from "fs";
import path from "path";

/**
 * @route   GET /api/users/search
 * @desc    Search for users by username or display name
 * @access  Private
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const users = await User.find({
      $or: [{ username: searchRegex }, { displayName: searchRegex }],
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select("username displayName avatarUrl bio isLegend")
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/users/profile/:username
 * @desc    Get user profile by username
 * @access  Public
 */
export const getUserProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-password -refreshToken -settings")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if profile is private and requester is not a friend
    if (user.isPrivate && req.user) {
      const isFriend = user.friends.some(
        (friendId) => friendId.toString() === req.user._id.toString()
      );
      if (!isFriend && user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "This profile is private",
        });
      }
    }

    // Get user stats
    const [uploadCount, likeCount, playlistCount] = await Promise.all([
      Song.countDocuments({ uploadedBy: user._id }),
      Song.countDocuments({ likes: user._id }),
      Playlist.countDocuments({ owner: user._id, isPublic: true }),
    ]);

    const profile = {
      ...user,
      stats: {
        uploads: uploadCount,
        likes: likeCount,
        playlists: playlistCount,
        followers: user.followersCount || 0,
        following: user.followingCount || 0,
      },
    };

    res.status(200).json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile by ID
 * @access  Public
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -refreshToken -settings")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, location, website, avatarUrl } = req.body;

    const updateFields = {};
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/users/settings/privacy
 * @desc    Update privacy settings
 * @access  Private
 */
export const updatePrivacySettings = async (req, res) => {
  try {
    const { isPrivate, whoCanSendRequests, showLikedSongs, showPlaylists } =
      req.body;

    const updateFields = {};
    if (isPrivate !== undefined) updateFields.isPrivate = isPrivate;
    if (whoCanSendRequests !== undefined)
      updateFields["settings.privacy.whoCanSendRequests"] = whoCanSendRequests;
    if (showLikedSongs !== undefined)
      updateFields["settings.privacy.showLikedSongs"] = showLikedSongs;
    if (showPlaylists !== undefined)
      updateFields["settings.privacy.showPlaylists"] = showPlaylists;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Privacy settings updated",
      user,
    });
  } catch (error) {
    console.error("Update privacy settings error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update privacy settings",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/users/settings/notifications
 * @desc    Update notification settings
 * @access  Private
 */
export const updateNotificationSettings = async (req, res) => {
  try {
    const { push, email, friendRequests, likes, comments } = req.body;

    const updateFields = {};
    if (push !== undefined) updateFields["settings.notifications.push"] = push;
    if (email !== undefined)
      updateFields["settings.notifications.email"] = email;
    if (friendRequests !== undefined)
      updateFields["settings.notifications.friendRequests"] = friendRequests;
    if (likes !== undefined)
      updateFields["settings.notifications.likes"] = likes;
    if (comments !== undefined)
      updateFields["settings.notifications.comments"] = comments;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Notification settings updated",
      user,
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update notification settings",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/users/settings/playback
 * @desc    Update playback settings
 * @access  Private
 */
export const updatePlaybackSettings = async (req, res) => {
  try {
    const { audioQuality, autoplay, crossfade, crossfadeDuration } = req.body;

    const updateFields = {};
    if (audioQuality !== undefined)
      updateFields["settings.playback.audioQuality"] = audioQuality;
    if (autoplay !== undefined)
      updateFields["settings.playback.autoplay"] = autoplay;
    if (crossfade !== undefined)
      updateFields["settings.playback.crossfade"] = crossfade;
    if (crossfadeDuration !== undefined)
      updateFields["settings.playback.crossfadeDuration"] = crossfadeDuration;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Playback settings updated",
      user,
    });
  } catch (error) {
    console.error("Update playback settings error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update playback settings",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/users/settings/appearance
 * @desc    Update appearance settings
 * @access  Private
 */
export const updateAppearanceSettings = async (req, res) => {
  try {
    const { theme, accentColor } = req.body;

    const updateFields = {};
    if (theme !== undefined) updateFields["settings.appearance.theme"] = theme;
    if (accentColor !== undefined)
      updateFields["settings.appearance.accentColor"] = accentColor;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Appearance settings updated",
      user,
    });
  } catch (error) {
    console.error("Update appearance settings error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update appearance settings",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/users/:userId/uploads
 * @desc    Get user's uploaded songs
 * @access  Public
 */
export const getUserUploads = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const songs = await Song.find({ uploadedBy: userId })
      .populate("uploadedBy", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Song.countDocuments({ uploadedBy: userId });

    res.status(200).json({
      success: true,
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user uploads error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user uploads",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/users/:userId/likes
 * @desc    Get user's liked songs
 * @access  Public
 */
export const getUserLikes = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select("likedSongs settings");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check privacy settings
    if (req.user?.id !== userId && !user.settings?.privacy?.showLikedSongs) {
      return res.status(403).json({
        success: false,
        message: "User's liked songs are private",
      });
    }

    const songs = await Song.find({ _id: { $in: user.likedSongs } })
      .populate("uploadedBy", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = user.likedSongs.length;

    res.status(200).json({
      success: true,
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user likes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user likes",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/users/:userId/playlists
 * @desc    Get user's playlists
 * @access  Public
 */
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("settings");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check privacy settings
    const isOwnProfile = req.user?._id?.toString() === userId;
    const showPlaylists = user.settings?.privacy?.showPlaylists !== false;

    if (!isOwnProfile && !showPlaylists) {
      return res.status(403).json({
        success: false,
        message: "User's playlists are private",
      });
    }

    const playlists = await Playlist.find({
      owner: userId,
      isPublic: true,
    })
      .populate("owner", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      playlists,
      count: playlists.length,
    });
  } catch (error) {
    console.error("Get user playlists error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user playlists",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user's songs
    await Song.deleteMany({ uploadedBy: userId });

    // Delete user's playlists
    await Playlist.deleteMany({ owner: userId });

    // Remove user from friends lists
    await User.updateMany({ friends: userId }, { $pull: { friends: userId } });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/users/avatar
 * @desc    Upload/update user avatar
 * @access  Private
 * @files   avatar (image file)
 */
export const uploadAvatar = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const imageFile = req.file;
    let avatarUrl = "";

    // Upload to Cloudinary if configured, otherwise use local storage
    if (isCloudinaryConfigured()) {
      try {
        console.log("Uploading avatar to Cloudinary...");
        const result = await uploadImageToCloudinary(imageFile.path);
        avatarUrl = result.url;

        // Clean up local file after successful upload
        if (fs.existsSync(imageFile.path)) {
          fs.unlinkSync(imageFile.path);
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        // Clean up local file
        if (fs.existsSync(imageFile.path)) {
          fs.unlinkSync(imageFile.path);
        }
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar to cloud storage",
          error: cloudinaryError.message,
        });
      }
    } else {
      // Use local storage URL
      avatarUrl = `/uploads/images/${imageFile.filename}`;
    }

    // Update user's avatar URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatarUrl,
      user,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};
