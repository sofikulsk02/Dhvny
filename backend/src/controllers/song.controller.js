import Song from "../models/Song.model.js";

/**
 * @route   GET /api/songs
 * @desc    Get all songs with pagination, search, and filters
 * @access  Public
 * @query   page, limit, search, genre, uploadedBy, isLegend, sortBy
 */
export const getAllSongs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      genre = "",
      uploadedBy = "",
      isLegend = "",
      sortBy = "-createdAt",
      includeAll = "false", // New parameter for jam sessions
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Only filter by isPublic and isApproved if not including all songs
    if (includeAll !== "true") {
      query.isPublic = true;
      query.isApproved = true;
    }

    if (search) {
      // Use regex for partial matching (case-insensitive)
      // Search in title, artist, and album fields
      const searchRegex = new RegExp(search, "i"); // 'i' for case-insensitive
      query.$or = [
        { title: searchRegex },
        { artist: searchRegex },
        { album: searchRegex },
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    if (isLegend === "true") {
      query.isLegend = true;
    }

    // Execute query
    const songs = await Song.find(query)
      .populate("uploadedBy", "displayName username avatar")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Song.countDocuments(query);

    // Add liked status if user is authenticated
    const userId = req.user?._id;
    const songsWithLiked = songs.map((song) => ({
      ...song,
      songId: song.songId || song._id.toString(),
      id: song._id.toString(),
      liked: userId ? song.likedBy?.some((id) => id.equals(userId)) : false,
    }));

    res.status(200).json({
      success: true,
      songs: songsWithLiked,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all songs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch songs",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/songs/:id
 * @desc    Get single song by ID
 * @access  Public
 */
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("uploadedBy", "displayName username avatar")
      .lean();

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Add liked status if user is authenticated
    const userId = req.user?._id;
    const songWithLiked = {
      ...song,
      songId: song.songId || song._id.toString(),
      id: song._id.toString(),
      liked: userId ? song.likedBy?.some((id) => id.equals(userId)) : false,
    };

    res.status(200).json({
      success: true,
      song: songWithLiked,
    });
  } catch (error) {
    console.error("Get song by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch song",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/songs/user/:userId
 * @desc    Get all songs uploaded by a specific user
 * @access  Public
 */
export const getSongsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, sortBy = "-createdAt" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const songs = await Song.find({ uploadedBy: userId, isPublic: true })
      .populate("uploadedBy", "displayName username avatar")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Song.countDocuments({
      uploadedBy: userId,
      isPublic: true,
    });

    // Add liked status if user is authenticated
    const currentUserId = req.user?._id;
    const songsWithLiked = songs.map((song) => ({
      ...song,
      songId: song.songId || song._id.toString(),
      id: song._id.toString(),
      liked: currentUserId
        ? song.likedBy?.some((id) => id.equals(currentUserId))
        : false,
    }));

    res.status(200).json({
      success: true,
      songs: songsWithLiked,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get songs by user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user songs",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/songs/:id
 * @desc    Delete a song (only by uploader or admin)
 * @access  Private
 */
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check if user is the uploader or admin
    if (
      song.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this song",
      });
    }

    await song.deleteOne();

    res.status(200).json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("Delete song error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete song",
      error: error.message,
    });
  }
};

/**
 * @route   PATCH /api/songs/:id
 * @desc    Update song metadata (only by uploader)
 * @access  Private
 */
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check if user is the uploader
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this song",
      });
    }

    // Update allowed fields
    const { title, artist, album, lyrics, tags, genre, isPublic } = req.body;

    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (album !== undefined) song.album = album;
    if (lyrics !== undefined) song.lyrics = lyrics;
    if (tags) song.tags = tags;
    if (genre !== undefined) song.genre = genre;
    if (typeof isPublic === "boolean") song.isPublic = isPublic;

    await song.save();
    await song.populate("uploadedBy", "displayName username avatar");

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      song,
    });
  } catch (error) {
    console.error("Update song error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update song",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/songs/:id/play
 * @desc    Increment play count
 * @access  Public
 */
export const incrementPlayCount = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    song.playsCount += 1;
    await song.save();

    res.status(200).json({
      success: true,
      playsCount: song.playsCount,
    });
  } catch (error) {
    console.error("Increment play count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment play count",
      error: error.message,
    });
  }
};
