import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";
import userRoutes from "./routes/user.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import jamRoutes from "./routes/jam.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import likesRoutes from "./routes/likes.routes.js";

// Import socket handlers
import { initializeSocketHandlers } from "./sockets/index.js";

// Import middleware
import { errorHandler } from "./middleware/error.middleware.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to routes
app.set("io", io);

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5174",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded audio/images)
app.use("/uploads", express.static("uploads"));

// Apply rate limiting
app.use("/api/", rateLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/songs", likesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/jam", jamRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// Database connection
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dhvny";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO ready for real-time connections`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

export { io };
