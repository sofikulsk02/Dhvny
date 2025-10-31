import express from "express";
import { uploadSong, uploadAvatar } from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/upload/song
 * @desc    Upload a new song with audio file and optional cover
 * @access  Private
 */
router.post(
  "/song",
  protect,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadSong
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
