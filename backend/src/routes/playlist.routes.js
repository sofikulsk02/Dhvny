import express from "express";
import {
  createPlaylist,
  getMyPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  togglePlaylistLike,
  getGlobalPlaylist,
  createGlobalPlaylist,
  addSongToGlobalPlaylist,
  removeSongFromGlobalPlaylist,
} from "../controllers/playlists.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Global playlist routes (must be before /:playlistId routes)
router.get("/global", getGlobalPlaylist);
router.post("/global/create", protect, createGlobalPlaylist);
router.post("/global/songs", protect, addSongToGlobalPlaylist);
router.delete("/global/songs/:songId", protect, removeSongFromGlobalPlaylist);

// Create playlist
router.post("/", protect, createPlaylist);

// Get my playlists
router.get("/my", protect, getMyPlaylists);

// Get public playlists
router.get("/public", getPublicPlaylists);

// Get playlist by ID
router.get("/:playlistId", optionalAuth, getPlaylistById);

// Update playlist
router.put("/:playlistId", protect, updatePlaylist);

// Delete playlist
router.delete("/:playlistId", protect, deletePlaylist);

// Add song to playlist
router.post("/:playlistId/songs", protect, addSongToPlaylist);

// Remove song from playlist
router.delete("/:playlistId/songs/:songId", protect, removeSongFromPlaylist);

// Like/unlike playlist
router.post("/:playlistId/like", protect, togglePlaylistLike);

export default router;
