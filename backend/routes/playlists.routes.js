const express = require("express");
const router = express.Router();
const playlistsController = require("../controllers/playlists.controller");
const { protect } = require("../middleware/auth.middleware");

// Create playlist
router.post("/", protect, playlistsController.createPlaylist);

// Get my playlists
router.get("/", protect, playlistsController.getMyPlaylists);

// Get public playlists
router.get("/public", playlistsController.getPublicPlaylists);

// Get playlist by ID
router.get("/:playlistId", playlistsController.getPlaylistById);

// Update playlist
router.put("/:playlistId", protect, playlistsController.updatePlaylist);

// Delete playlist
router.delete("/:playlistId", protect, playlistsController.deletePlaylist);

// Add song to playlist
router.post(
  "/:playlistId/songs",
  protect,
  playlistsController.addSongToPlaylist
);

// Remove song from playlist
router.delete(
  "/:playlistId/songs/:songId",
  protect,
  playlistsController.removeSongFromPlaylist
);

// Like/unlike playlist
router.post(
  "/:playlistId/like",
  protect,
  playlistsController.togglePlaylistLike
);

module.exports = router;
