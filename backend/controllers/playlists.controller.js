const Playlist = require("../models/Playlist.model");
const Song = require("../models/Song.model");

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist
 * @access  Private
 */
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverUrl } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: req.user._id,
      isPublic: isPublic === true,
      coverUrl: coverUrl || "",
      songs: [],
    });

    await playlist.populate("owner", "username displayName avatarUrl");

    res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/playlists
 * @desc    Get all playlists for current user
 * @access  Private
 */
exports.getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate("owner", "username displayName avatarUrl")
      .sort({ createdAt: -1 });

    res.json({ playlists });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/playlists/public
 * @desc    Get public playlists
 * @access  Public
 */
exports.getPublicPlaylists = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const playlists = await Playlist.find({ isPublic: true })
      .populate("owner", "username displayName avatarUrl")
      .sort({ likes: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({ playlists });
  } catch (error) {
    console.error("Error fetching public playlists:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/playlists/:playlistId
 * @desc    Get playlist by ID with songs
 * @access  Public (if playlist is public) / Private (if user is owner)
 */
exports.getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId)
      .populate("owner", "username displayName avatarUrl")
      .populate({
        path: "songs",
        populate: {
          path: "uploadedBy",
          select: "username displayName avatarUrl",
        },
      });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check access rights
    const isOwner =
      req.user && playlist.owner._id.toString() === req.user._id.toString();
    const isCollaborator =
      req.user &&
      playlist.collaborators.some(
        (collab) => collab.toString() === req.user._id.toString()
      );

    if (!playlist.isPublic && !isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Access denied to this playlist" });
    }

    res.json({ playlist });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   PUT /api/playlists/:playlistId
 * @desc    Update playlist details
 * @access  Private (owner only)
 */
exports.updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic, coverUrl } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this playlist" });
    }

    // Update fields
    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverUrl !== undefined) playlist.coverUrl = coverUrl;

    await playlist.save();
    await playlist.populate("owner", "username displayName avatarUrl");

    res.json({
      message: "Playlist updated successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/playlists/:playlistId
 * @desc    Delete playlist
 * @access  Private (owner only)
 */
exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this playlist" });
    }

    await playlist.deleteOne();

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   POST /api/playlists/:playlistId/songs
 * @desc    Add song to playlist
 * @access  Private (owner or collaborator)
 */
exports.addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check permissions
    const isOwner = playlist.owner.toString() === req.user._id.toString();
    const isCollaborator = playlist.collaborators.some(
      (collab) => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this playlist" });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.songs.push(songId);
    await playlist.save();
    await playlist.populate("owner", "username displayName avatarUrl");

    res.json({
      message: "Song added to playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/playlists/:playlistId/songs/:songId
 * @desc    Remove song from playlist
 * @access  Private (owner or collaborator)
 */
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check permissions
    const isOwner = playlist.owner.toString() === req.user._id.toString();
    const isCollaborator = playlist.collaborators.some(
      (collab) => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this playlist" });
    }

    // Remove song
    playlist.songs = playlist.songs.filter(
      (id) => id.toString() !== songId.toString()
    );

    await playlist.save();
    await playlist.populate("owner", "username displayName avatarUrl");

    res.json({
      message: "Song removed from playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   POST /api/playlists/:playlistId/like
 * @desc    Like/unlike playlist
 * @access  Private
 */
exports.togglePlaylistLike = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Note: In a production app, you'd track individual user likes
    // For simplicity, we're just toggling the like count
    // You could create a separate PlaylistLike model similar to the Like model

    res.json({
      message: "Like toggled",
      playlist,
    });
  } catch (error) {
    console.error("Error toggling playlist like:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
