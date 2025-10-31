import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
