import JamSession from "../models/JamSession.js";
import Song from "../models/Song.model.js";

/**
 * @route   POST /api/jam
 * @desc    Create a new jam session
 * @access  Private
 */
export const createJamSession = async (req, res) => {
  try {
    const { name, isPublic = false, maxParticipants = 10 } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Jam session name is required",
      });
    }

    const jamSession = new JamSession({
      name: name.trim(),
      host: req.user._id,
      participants: [
        {
          user: req.user._id,
          joinedAt: new Date(),
        },
      ],
      isPublic,
      maxParticipants,
    });

    await jamSession.save();

    // Populate host and participants
    await jamSession.populate("host", "displayName username avatar");
    await jamSession.populate(
      "participants.user",
      "displayName username avatar"
    );

    console.log(
      "✅ Jam session created:",
      jamSession._id,
      "by",
      req.user.displayName
    );

    res.status(201).json({
      success: true,
      jamSession,
    });
  } catch (error) {
    console.error("Error creating jam session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create jam session",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/jam
 * @desc    Get all active jam sessions (public + user's sessions)
 * @access  Private
 */
export const getJamSessions = async (req, res) => {
  try {
    const jamSessions = await JamSession.find({
      isActive: true,
      $or: [
        { isPublic: true },
        { host: req.user._id },
        { "participants.user": req.user._id },
      ],
    })
      .populate("host", "displayName username avatar")
      .populate("participants.user", "displayName username avatar")
      .populate("currentSong", "title artist coverUrl audioUrl duration")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      jamSessions,
    });
  } catch (error) {
    console.error("Error fetching jam sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jam sessions",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/jam/:sessionId
 * @desc    Get jam session by ID
 * @access  Private
 */
export const getJamSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const jamSession = await JamSession.findById(sessionId)
      .populate("host", "displayName username avatar")
      .populate("participants.user", "displayName username avatar")
      .populate("currentSong", "title artist coverUrl audioUrl duration")
      .populate("queue", "title artist coverUrl audioUrl duration");

    if (!jamSession) {
      return res.status(404).json({
        success: false,
        message: "Jam session not found",
      });
    }

    // Check if user has access
    const userId = req.user._id.toString();
    const isHost = jamSession.host._id.toString() === userId;
    const isParticipant = jamSession.participants.some(
      (p) => p.user._id.toString() === userId
    );
    const isPublic = jamSession.isPublic;

    if (!isHost && !isParticipant && !isPublic) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this jam session",
      });
    }

    res.json({
      success: true,
      jamSession,
    });
  } catch (error) {
    console.error("Error fetching jam session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jam session",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/jam/:sessionId/join
 * @desc    Join a jam session
 * @access  Private
 */
export const joinJamSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const jamSession = await JamSession.findById(sessionId);

    if (!jamSession) {
      return res.status(404).json({
        success: false,
        message: "Jam session not found",
      });
    }

    if (!jamSession.isActive) {
      return res.status(400).json({
        success: false,
        message: "This jam session has ended",
      });
    }

    // Check if already a participant
    const isAlreadyParticipant = jamSession.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      await jamSession.populate("host", "displayName username avatar");
      await jamSession.populate(
        "participants.user",
        "displayName username avatar"
      );
      await jamSession.populate(
        "currentSong",
        "title artist coverUrl audioUrl duration"
      );
      await jamSession.populate(
        "queue",
        "title artist coverUrl audioUrl duration"
      );

      return res.json({
        success: true,
        message: "Already in the jam session",
        jamSession,
      });
    }

    // Check max participants
    if (jamSession.participants.length >= jamSession.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Jam session is full",
      });
    }

    // Check if public or user has access
    if (
      !jamSession.isPublic &&
      jamSession.host.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This jam session is private",
      });
    }

    // Add participant
    jamSession.participants.push({
      user: req.user._id,
      joinedAt: new Date(),
    });

    await jamSession.save();

    await jamSession.populate("host", "displayName username avatar");
    await jamSession.populate(
      "participants.user",
      "displayName username avatar"
    );
    await jamSession.populate(
      "currentSong",
      "title artist coverUrl audioUrl duration"
    );
    await jamSession.populate(
      "queue",
      "title artist coverUrl audioUrl duration"
    );

    console.log(
      "✅ User joined jam session:",
      req.user.displayName,
      "→",
      sessionId
    );

    res.json({
      success: true,
      message: "Joined jam session",
      jamSession,
    });
  } catch (error) {
    console.error("Error joining jam session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join jam session",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/jam/:sessionId/leave
 * @desc    Leave a jam session
 * @access  Private
 */
export const leaveJamSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const jamSession = await JamSession.findById(sessionId);

    if (!jamSession) {
      return res.status(404).json({
        success: false,
        message: "Jam session not found",
      });
    }

    // Remove participant
    jamSession.participants = jamSession.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );

    // If host leaves or no participants left, end the session
    if (
      jamSession.host.toString() === req.user._id.toString() ||
      jamSession.participants.length === 0
    ) {
      jamSession.isActive = false;
      console.log("🛑 Jam session ended:", sessionId);
    }

    await jamSession.save();

    console.log(
      "✅ User left jam session:",
      req.user.displayName,
      "←",
      sessionId
    );

    res.json({
      success: true,
      message: "Left jam session",
    });
  } catch (error) {
    console.error("Error leaving jam session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave jam session",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/jam/:sessionId
 * @desc    End a jam session (host only)
 * @access  Private
 */
export const endJamSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const jamSession = await JamSession.findById(sessionId);

    if (!jamSession) {
      return res.status(404).json({
        success: false,
        message: "Jam session not found",
      });
    }

    // Only host can end the session
    if (jamSession.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can end the jam session",
      });
    }

    jamSession.isActive = false;
    await jamSession.save();

    console.log("🛑 Jam session ended by host:", sessionId);

    res.json({
      success: true,
      message: "Jam session ended",
    });
  } catch (error) {
    console.error("Error ending jam session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end jam session",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/jam/:sessionId/queue
 * @desc    Add song to jam session queue
 * @access  Private
 */
export const addToQueue = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Song ID is required",
      });
    }

    const jamSession = await JamSession.findById(sessionId);

    if (!jamSession) {
      return res.status(404).json({
        success: false,
        message: "Jam session not found",
      });
    }

    // Check if user is a participant
    const isParticipant = jamSession.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You must be a participant to add songs",
      });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Add to queue
    jamSession.queue.push(songId);
    await jamSession.save();

    await jamSession.populate(
      "queue",
      "title artist coverUrl audioUrl duration"
    );

    console.log("✅ Song added to jam queue:", song.title, "→", sessionId);

    res.json({
      success: true,
      message: "Song added to queue",
      queue: jamSession.queue,
    });
  } catch (error) {
    console.error("Error adding song to queue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add song to queue",
      error: error.message,
    });
  }
};
