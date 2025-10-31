import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../controllers/comment.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Song comments routes (need songId in URL)
// These will be mounted at /api/songs/:songId/comments in song routes

// Comment-specific routes
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleCommentLike);

export default router;
