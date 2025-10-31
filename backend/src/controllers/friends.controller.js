import Friendship from "../models/Friendship.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";
import {
  createNotification,
  emitNotification,
} from "./notifications.controller.js";

/**
 * @route   POST /api/friends/request
 * @desc    Send a friend request
 * @access  Private
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    // Validate recipient ID
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID",
      });
    }

    // Can't send request to yourself
    if (requesterId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send friend request to yourself",
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if request already exists (in any direction)
    const existingRequest = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "You are already friends",
        });
      }
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Friend request already sent",
        });
      }
      if (existingRequest.status === "blocked") {
        return res.status(400).json({
          success: false,
          message: "Cannot send friend request",
        });
      }
    }

    // Create new friend request
    const friendRequest = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    const populatedRequest = await Friendship.findById(friendRequest._id)
      .populate("requester", "displayName username avatar")
      .populate("recipient", "displayName username avatar");

    // Send notification to recipient
    const notification = await createNotification({
      recipient: recipientId,
      sender: requesterId,
      type: "friend_request",
      content: `${req.user.displayName} sent you a friend request`,
      link: `/friends`,
    });

    // Emit real-time notification if user is online
    if (req.app.get("io")) {
      emitNotification(req.app.get("io"), recipientId, notification);
    }

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      friendRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send friend request",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/friends/accept/:requestId
 * @desc    Accept a friend request
 * @access  Private
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await Friendship.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Only the recipient can accept
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only accept requests sent to you",
      });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${friendRequest.status}`,
      });
    }

    // Update request status
    friendRequest.status = "accepted";
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    const populatedRequest = await Friendship.findById(friendRequest._id)
      .populate("requester", "displayName username avatar")
      .populate("recipient", "displayName username avatar");

    // Send notification to the original requester
    const notification = await createNotification({
      recipient: friendRequest.requester,
      sender: userId,
      type: "friend_accept",
      content: `${req.user.displayName} accepted your friend request`,
      link: `/friends`,
    });

    // Emit real-time notification if user is online
    if (req.app.get("io")) {
      emitNotification(
        req.app.get("io"),
        friendRequest.requester,
        notification
      );
    }

    res.status(200).json({
      success: true,
      message: "Friend request accepted",
      friendRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/friends/reject/:requestId
 * @desc    Reject a friend request
 * @access  Private
 */
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await Friendship.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // Only the recipient can reject
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only reject requests sent to you",
      });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${friendRequest.status}`,
      });
    }

    // Update request status
    friendRequest.status = "rejected";
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    // Send notification to the original requester
    const notification = await createNotification({
      recipient: friendRequest.requester,
      sender: userId,
      type: "friend_reject",
      content: `${req.user.displayName} declined your friend request`,
      link: `/friends`,
    });

    // Emit real-time notification if user is online
    if (req.app.get("io")) {
      emitNotification(
        req.app.get("io"),
        friendRequest.requester,
        notification
      );
    }

    res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject friend request",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/friends/:friendId
 * @desc    Remove a friend
 * @access  Private
 */
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Find the friendship (can be in either direction)
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId, status: "accepted" },
        { requester: friendId, recipient: userId, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friendship not found",
      });
    }

    // Delete the friendship
    await Friendship.findByIdAndDelete(friendship._id);

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove friend",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/friends
 * @desc    Get all friends (accepted friendships)
 * @access  Private
 */
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted friendships where user is either requester or recipient
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    })
      .populate("requester", "displayName username avatar bio")
      .populate("recipient", "displayName username avatar bio")
      .sort("-respondedAt");

    // Extract the friend user (not the current user)
    const friends = friendships.map((friendship) => {
      const friend =
        friendship.requester._id.toString() === userId.toString()
          ? friendship.recipient
          : friendship.requester;

      return {
        _id: friend._id,
        displayName: friend.displayName,
        username: friend.username,
        avatar: friend.avatar,
        bio: friend.bio,
        friendsSince: friendship.respondedAt,
      };
    });

    res.status(200).json({
      success: true,
      friends,
      count: friends.length,
    });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch friends",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/friends/requests/pending
 * @desc    Get all pending friend requests (received)
 * @access  Private
 */
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.find({
      recipient: userId,
      status: "pending",
    })
      .populate("requester", "displayName username avatar bio")
      .sort("-requestedAt");

    res.status(200).json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/friends/requests/sent
 * @desc    Get all sent friend requests (by current user)
 * @access  Private
 */
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Friendship.find({
      requester: userId,
      status: "pending",
    })
      .populate("recipient", "displayName username avatar bio")
      .sort("-requestedAt");

    res.status(200).json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("Get sent requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sent requests",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/friends/status/:userId
 * @desc    Check friendship status with another user
 * @access  Private
 */
export const getFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === userId.toString()) {
      return res.status(200).json({
        success: true,
        status: "self",
      });
    }

    const friendship = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId },
      ],
    });

    if (!friendship) {
      return res.status(200).json({
        success: true,
        status: "none",
      });
    }

    // Determine if current user is requester or recipient
    const isRequester =
      friendship.requester.toString() === currentUserId.toString();

    res.status(200).json({
      success: true,
      status: friendship.status,
      isRequester,
      friendshipId: friendship._id,
    });
  } catch (error) {
    console.error("Get friendship status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check friendship status",
      error: error.message,
    });
  }
};
