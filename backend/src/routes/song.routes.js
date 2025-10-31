import express from "express";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";
import {
  getAllSongs,
  getSongById,
  getSongsByUser,
  deleteSong,
  updateSong,
  incrementPlayCount,
} from "../controllers/song.controller.js";
import {
  createComment,
  getComments,
} from "../controllers/comment.controller.js";

const router = express.Router();

/**
 * @route   GET /api/songs
 * @desc    Get all songs with pagination and filters
 * @access  Public
 */
router.get("/", optionalAuth, getAllSongs);

/**
 * @route   GET /api/songs/:id
 * @desc    Get single song by ID
 * @access  Public
 */
router.get("/:id", optionalAuth, getSongById);

/**
 * @route   GET /api/songs/user/:userId
 * @desc    Get all songs by a specific user
 * @access  Public
 */
router.get("/user/:userId", optionalAuth, getSongsByUser);

/**
 * @route   PATCH /api/songs/:id
 * @desc    Update song metadata
 * @access  Private (uploader only)
 */
router.patch("/:id", protect, updateSong);

/**
 * @route   DELETE /api/songs/:id
 * @desc    Delete a song
 * @access  Private (uploader only)
 */
router.delete("/:id", protect, deleteSong);

/**
 * @route   POST /api/songs/:id/play
 * @desc    Increment play count
 * @access  Public
 */
router.post("/:id/play", incrementPlayCount);

/**
 * @route   POST /api/songs/:songId/comments
 * @desc    Create a comment on a song
 * @access  Private
 */
router.post("/:songId/comments", protect, createComment);

/**
 * @route   GET /api/songs/:songId/comments
 * @desc    Get all comments for a song
 * @access  Public
 */
router.get("/:songId/comments", optionalAuth, getComments);

export default router;
