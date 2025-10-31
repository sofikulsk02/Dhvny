import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getFriendshipStatus,
} from "../controllers/friends.controller.js";

const router = express.Router();

/**
 * @route   POST /api/friends/request
 * @desc    Send a friend request
 * @access  Private
 */
router.post("/request", protect, sendFriendRequest);

/**
 * @route   POST /api/friends/accept/:requestId
 * @desc    Accept a friend request
 * @access  Private
 */
router.post("/accept/:requestId", protect, acceptFriendRequest);

/**
 * @route   POST /api/friends/reject/:requestId
 * @desc    Reject a friend request
 * @access  Private
 */
router.post("/reject/:requestId", protect, rejectFriendRequest);

/**
 * @route   DELETE /api/friends/:friendId
 * @desc    Remove a friend
 * @access  Private
 */
router.delete("/:friendId", protect, removeFriend);

/**
 * @route   GET /api/friends
 * @desc    Get all friends (accepted friendships)
 * @access  Private
 */
router.get("/", protect, getFriends);

/**
 * @route   GET /api/friends/requests/pending
 * @desc    Get pending friend requests (received)
 * @access  Private
 */
router.get("/requests/pending", protect, getPendingRequests);

/**
 * @route   GET /api/friends/requests/sent
 * @desc    Get sent friend requests
 * @access  Private
 */
router.get("/requests/sent", protect, getSentRequests);

/**
 * @route   GET /api/friends/status/:userId
 * @desc    Check friendship status with a user
 * @access  Private
 */
router.get("/status/:userId", protect, getFriendshipStatus);

export default router;
