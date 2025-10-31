import Comment from "../models/Comment.model.js";
import Song from "../models/Song.model.js";
import {
  createNotification,
  emitNotification,
} from "./notifications.controller.js";

/**
 * @route   POST /api/songs/:songId/comments
 * @desc    Create a new comment on a song
 * @access  Private
 */
export const createComment = async (req, res) => {
  try {
    const { songId } = req.params;
    const { content, parentComment } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    // Verify song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Create comment
    const comment = new Comment({
      song: songId,
      user: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    await comment.save();
    await comment.populate("user", "displayName username avatar");

    // Update song comments count
    song.commentsCount += 1;
    await song.save();

    // If it's a reply, add to parent's replies array
    if (parentComment) {
      const parentCommentDoc = await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } },
        { new: true }
      ).populate("user", "_id displayName");

      // Send notification to parent comment author (if not self-reply)
      if (
        parentCommentDoc &&
        parentCommentDoc.user._id.toString() !== req.user._id.toString()
      ) {
        const notification = await createNotification({
          recipient: parentCommentDoc.user._id,
          sender: req.user._id,
          type: "comment_reply",
          content: `${req.user.displayName} replied to your comment`,
          relatedSong: songId,
          relatedComment: comment._id,
          link: `/songs/${songId}`,
        });

        // Emit real-time notification if user is online
        if (req.app.get("io")) {
          emitNotification(
            req.app.get("io"),
            parentCommentDoc.user._id,
            notification
          );
        }
      }
    } else {
      // Top-level comment - notify song owner
      if (song.uploadedBy.toString() !== req.user._id.toString()) {
        const notification = await createNotification({
          recipient: song.uploadedBy,
          sender: req.user._id,
          type: "comment_reply",
          content: `${req.user.displayName} commented on your song`,
          relatedSong: songId,
          relatedComment: comment._id,
          link: `/songs/${songId}`,
        });

        // Emit real-time notification if user is online
        if (req.app.get("io")) {
          emitNotification(req.app.get("io"), song.uploadedBy, notification);
        }
      }
    }

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/songs/:songId/comments
 * @desc    Get all comments for a song
 * @access  Public
 */
export const getComments = async (req, res) => {
  try {
    const { songId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      song: songId,
      parentComment: null,
      isDeleted: false,
    })
      .populate("user", "displayName username avatar")
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "displayName username avatar",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Comment.countDocuments({
      song: songId,
      parentComment: null,
      isDeleted: false,
    });

    // Add liked status if user is authenticated
    const userId = req.user?._id;
    const commentsWithLiked = comments.map((comment) => ({
      ...comment,
      liked: userId ? comment.likedBy?.some((id) => id.equals(userId)) : false,
      replies: comment.replies?.map((reply) => ({
        ...reply,
        liked: userId ? reply.likedBy?.some((id) => id.equals(userId)) : false,
      })),
    }));

    res.status(200).json({
      success: true,
      comments: commentsWithLiked,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private (only comment author)
 */
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();
    await comment.populate("user", "displayName username avatar");

    res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (soft delete)
 * @access  Private (only comment author or admin)
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();

    // Update song comments count
    await Song.findByIdAndUpdate(comment.song, {
      $inc: { commentsCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/comments/:id/like
 * @desc    Toggle like on a comment
 * @access  Private
 */
export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const userId = req.user._id;
    const isLiked = comment.likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Like
      comment.likedBy.push(userId);
      comment.likesCount += 1;

      // Send notification to comment author (if not self-like)
      await comment.populate("user", "_id displayName");
      if (comment.user._id.toString() !== userId.toString()) {
        const notification = await createNotification({
          recipient: comment.user._id,
          sender: userId,
          type: "comment_like",
          content: `${req.user.displayName} liked your comment`,
          relatedSong: comment.song,
          relatedComment: comment._id,
          link: `/songs/${comment.song}`,
        });

        // Emit real-time notification if user is online
        if (req.app.get("io")) {
          emitNotification(req.app.get("io"), comment.user._id, notification);
        }
      }
    }

    await comment.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: comment.likesCount,
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle comment like",
      error: error.message,
    });
  }
};
