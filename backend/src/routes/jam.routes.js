import express from "express";
import {
  createJamSession,
  getJamSessions,
  getJamSession,
  joinJamSession,
  leaveJamSession,
  endJamSession,
  addToQueue,
} from "../controllers/jam.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Jam session routes
router.post("/", createJamSession);
router.get("/", getJamSessions);
router.get("/:sessionId", getJamSession);
router.post("/:sessionId/join", joinJamSession);
router.post("/:sessionId/leave", leaveJamSession);
router.delete("/:sessionId", endJamSession);
router.post("/:sessionId/queue", addToQueue);

export default router;
