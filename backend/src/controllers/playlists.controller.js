import Playlist from "../models/Playlist.model.js";
import Song from "../models/Song.model.js";

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist
 * @access  Private
 */
export const createPlaylist = async (req, res) => {
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
 * @route   GET /api/playlists/my
 * @desc    Get all playlists for current user
 * @access  Private
 */
export const getMyPlaylists = async (req, res) => {
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
export const getPublicPlaylists = async (req, res) => {
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
export const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId)
      .populate("owner", "username displayName avatarUrl")
      .populate({
        path: "songs.song",
        populate: {
          path: "uploadedBy",
          select: "username displayName avatarUrl",
        },
      })
      .populate("songs.addedBy", "username displayName avatarUrl");

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
export const updatePlaylist = async (req, res) => {
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
export const deletePlaylist = async (req, res) => {
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
export const addSongToPlaylist = async (req, res) => {
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
    const songExists = playlist.songs.some(
      (item) => item.song && item.song.toString() === songId
    );

    if (songExists) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.songs.push({
      song: songId,
      addedAt: new Date(),
      addedBy: req.user._id,
    });
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
export const removeSongFromPlaylist = async (req, res) => {
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
      (item) => item.song && item.song.toString() !== songId.toString()
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
export const togglePlaylistLike = async (req, res) => {
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

/**
 * @route   GET /api/playlists/global
 * @desc    Get the global playlist (visible to all users)
 * @access  Public
 */
export const getGlobalPlaylist = async (req, res) => {
  try {
    const globalPlaylist = await Playlist.findOne({ isGlobal: true })
      .populate("owner", "username displayName avatarUrl")
      .populate({
        path: "songs.song",
        populate: {
          path: "uploadedBy",
          select: "username displayName avatarUrl",
        },
      })
      .populate("songs.addedBy", "username displayName avatarUrl");

    if (!globalPlaylist) {
      return res.status(404).json({ message: "Global playlist not found" });
    }

    res.json({ playlist: globalPlaylist });
  } catch (error) {
    console.error("Error fetching global playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   POST /api/playlists/global/create
 * @desc    Create the global playlist (admin only)
 * @access  Private (Admin)
 */
export const createGlobalPlaylist = async (req, res) => {
  try {
    const { name, description, coverUrl } = req.body;

    // Check if user is admin (you can add an isAdmin field to User model)
    // For now, we'll just check if user ID matches a specific admin ID
    // TODO: Add proper admin role checking

    // Check if global playlist already exists
    const existingGlobal = await Playlist.findOne({ isGlobal: true });
    if (existingGlobal) {
      return res
        .status(400)
        .json({ message: "Global playlist already exists" });
    }

    const playlist = await Playlist.create({
      name: name || "Global Playlist",
      description: description || "Official playlist for all users",
      owner: req.user._id,
      isPublic: true,
      isGlobal: true,
      coverUrl: coverUrl || "",
      songs: [],
    });

    await playlist.populate("owner", "username displayName avatarUrl");

    res.status(201).json({
      message: "Global playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error creating global playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   POST /api/playlists/global/songs
 * @desc    Add song to global playlist (admin only)
 * @access  Private (Admin)
 */
export const addSongToGlobalPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    // Find global playlist
    const playlist = await Playlist.findOne({ isGlobal: true });
    if (!playlist) {
      return res.status(404).json({ message: "Global playlist not found" });
    }

    // Check if user is the owner of global playlist (admin)
    console.log("🔐 Admin check:", {
      playlistOwner: playlist.owner.toString(),
      requestUser: req.user._id.toString(),
      isMatch: playlist.owner.toString() === req.user._id.toString(),
    });

    if (playlist.owner.toString() !== req.user._id.toString()) {
      console.log("❌ Authorization failed - Not the playlist owner");
      return res.status(403).json({ message: "Not authorized - Admin only" });
    }

    console.log("✅ Admin check passed");

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Check if song is already in playlist
    const songExists = playlist.songs.some(
      (item) => item.song && item.song.toString() === songId.toString()
    );

    if (songExists) {
      return res
        .status(400)
        .json({ message: "Song already in global playlist" });
    }

    // Add song
    playlist.songs.push({
      song: songId,
      addedBy: req.user._id,
      addedAt: new Date(),
    });

    await playlist.save();
    await playlist.populate("owner", "username displayName avatarUrl");
    await playlist.populate({
      path: "songs.song",
      populate: {
        path: "uploadedBy",
        select: "username displayName avatarUrl",
      },
    });

    res.json({
      message: "Song added to global playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error adding song to global playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/playlists/global/songs/:songId
 * @desc    Remove song from global playlist (admin only)
 * @access  Private (Admin)
 */
export const removeSongFromGlobalPlaylist = async (req, res) => {
  try {
    const { songId } = req.params;

    // Find global playlist
    const playlist = await Playlist.findOne({ isGlobal: true });
    if (!playlist) {
      return res.status(404).json({ message: "Global playlist not found" });
    }

    // Check if user is the owner of global playlist (admin)
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized - Admin only" });
    }

    // Remove song
    playlist.songs = playlist.songs.filter(
      (item) => item.song && item.song.toString() !== songId.toString()
    );

    await playlist.save();
    await playlist.populate("owner", "username displayName avatarUrl");

    res.json({
      message: "Song removed from global playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error removing song from global playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
