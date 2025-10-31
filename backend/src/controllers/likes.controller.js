import Song from "../models/Song.model.js";
import User from "../models/User.model.js";
import {
  createNotification,
  emitNotification,
} from "./notifications.controller.js";

/**
 * @route   POST /api/songs/:id/like
 * @desc    Toggle like/unlike a song
 * @access  Private
 */
export const toggleLike = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate(
      "uploadedBy",
      "_id displayName"
    );

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    const userId = req.user._id;
    const isLiked = song.likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      song.likedBy = song.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      song.likesCount = Math.max(0, song.likesCount - 1);

      // Remove from user's liked songs
      await User.findByIdAndUpdate(userId, {
        $pull: { likedSongs: song._id },
      });
    } else {
      // Like
      song.likedBy.push(userId);
      song.likesCount += 1;

      // Add to user's liked songs
      await User.findByIdAndUpdate(userId, {
        $addToSet: { likedSongs: song._id },
      });

      // Send notification to song owner (if not self-like)
      if (song.uploadedBy._id.toString() !== userId.toString()) {
        const notification = await createNotification({
          recipient: song.uploadedBy._id,
          sender: userId,
          type: "like",
          content: `${req.user.displayName} liked your song "${song.title}"`,
          relatedSong: song._id,
          link: `/songs/${song._id}`,
        });

        // Emit real-time notification if user is online
        if (req.app.get("io")) {
          emitNotification(
            req.app.get("io"),
            song.uploadedBy._id,
            notification
          );
        }
      }
    }

    await song.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: song.likesCount,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/songs/:id/legend
 * @desc    Promote song to legend status
 * @access  Private
 */
export const promoteLegend = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate(
      "uploadedBy",
      "_id displayName"
    );

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    const userId = req.user._id;

    // Check if user already promoted this song
    if (song.legendPromotedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You already promoted this song",
      });
    }

    // Add user to promoters
    song.legendPromotedBy.push(userId);
    song.legendPromotionCount += 1;

    // Check if threshold reached (3 promotions)
    const wasNotLegend = !song.isLegend;
    if (song.legendPromotionCount >= 3 && !song.isLegend) {
      song.isLegend = true;

      // Send notification to song owner
      const notification = await createNotification({
        recipient: song.uploadedBy._id,
        sender: userId,
        type: "legend_promotion",
        content: `Your song "${song.title}" has been promoted to Legend status! 🏆`,
        relatedSong: song._id,
        link: `/songs/${song._id}`,
      });

      // Emit real-time notification if user is online
      if (req.app.get("io")) {
        emitNotification(req.app.get("io"), song.uploadedBy._id, notification);
      }
    }

    await song.save();

    res.status(200).json({
      success: true,
      isLegend: song.isLegend,
      legendPromotionCount: song.legendPromotionCount,
      message: song.isLegend
        ? "Song promoted to Legend!"
        : `${song.legendPromotionCount}/3 promotions`,
    });
  } catch (error) {
    console.error("Promote legend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to promote song",
      error: error.message,
    });
  }
};
