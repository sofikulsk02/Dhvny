import express from "express";
import { toggleLike, promoteLegend } from "../controllers/likes.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/songs/:id/like
router.post("/:id/like", toggleLike);

// @route   POST /api/songs/:id/legend
router.post("/:id/legend", promoteLegend);

export default router;
