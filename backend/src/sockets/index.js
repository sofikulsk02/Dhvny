// Socket.IO event handlers
// Support for real-time notifications, jam sessions, and chat

export const initializeSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user's personal notification room
    socket.on("join:notifications", (userId) => {
      if (userId) {
        const roomName = `user:${userId}`;
        socket.join(roomName);
        console.log(`User ${userId} joined notification room:`, roomName);
      }
    });

    // Leave user's notification room
    socket.on("leave:notifications", (userId) => {
      if (userId) {
        const roomName = `user:${userId}`;
        socket.leave(roomName);
        console.log(`User ${userId} left notification room:`, roomName);
      }
    });

    // Mark notification as read in real-time
    socket.on("notification:read", ({ userId, notificationId }) => {
      io.to(`user:${userId}`).emit("notification:marked_read", {
        notificationId,
      });
    });

    // Jam session handlers
    socket.on("join:jam", (jamSessionId) => {
      socket.join(`jam:${jamSessionId}`);
      console.log(`Socket ${socket.id} joined jam session:`, jamSessionId);
    });

    socket.on("leave:jam", (jamSessionId) => {
      socket.leave(`jam:${jamSessionId}`);
      console.log(`Socket ${socket.id} left jam session:`, jamSessionId);
    });

    // Jam playback sync events
    socket.on("jam:play", async ({ jamSessionId, songId, position }) => {
      console.log(
        `🎵 Jam play event: ${jamSessionId}, song: ${songId}, position: ${position}`
      );

      // Update jam session in database
      try {
        const JamSession = (await import("../models/JamSession.js")).default;
        await JamSession.findByIdAndUpdate(jamSessionId, {
          currentSong: songId,
          currentPosition: position,
          isPlaying: true,
          lastUpdated: new Date(),
        });
        console.log("✅ Updated jam session with current song");
      } catch (error) {
        console.error("❌ Failed to update jam session:", error);
      }

      socket.to(`jam:${jamSessionId}`).emit("jam:play", { songId, position });
    });

    socket.on("jam:pause", async ({ jamSessionId, position }) => {
      console.log(`⏸️ Jam pause event: ${jamSessionId}, position: ${position}`);

      // Update jam session in database
      try {
        const JamSession = (await import("../models/JamSession.js")).default;
        await JamSession.findByIdAndUpdate(jamSessionId, {
          currentPosition: position,
          isPlaying: false,
          lastUpdated: new Date(),
        });
        console.log("✅ Updated jam session pause state");
      } catch (error) {
        console.error("❌ Failed to update jam session:", error);
      }

      socket.to(`jam:${jamSessionId}`).emit("jam:pause", { position });
    });

    socket.on("jam:seek", ({ jamSessionId, position }) => {
      console.log(`⏩ Jam seek event: ${jamSessionId}, position: ${position}`);
      socket.to(`jam:${jamSessionId}`).emit("jam:seek", { position });
    });

    socket.on("jam:song_change", async ({ jamSessionId, songId }) => {
      console.log(`🎶 Jam song change: ${jamSessionId}, new song: ${songId}`);

      // Update jam session in database
      try {
        const JamSession = (await import("../models/JamSession.js")).default;
        await JamSession.findByIdAndUpdate(jamSessionId, {
          currentSong: songId,
          currentPosition: 0,
          isPlaying: true,
          lastUpdated: new Date(),
        });
        console.log("✅ Updated jam session with new song");
      } catch (error) {
        console.error("❌ Failed to update jam session:", error);
      }

      socket.to(`jam:${jamSessionId}`).emit("jam:song_change", { songId });
    });

    socket.on("jam:participant_joined", ({ jamSessionId, user }) => {
      console.log(`👋 User joined jam: ${user.displayName} → ${jamSessionId}`);
      io.to(`jam:${jamSessionId}`).emit("jam:participant_joined", { user });
    });

    socket.on("jam:participant_left", ({ jamSessionId, userId }) => {
      console.log(`👋 User left jam: ${userId} ← ${jamSessionId}`);
      io.to(`jam:${jamSessionId}`).emit("jam:participant_left", { userId });
    });

    socket.on("jam:queue_updated", ({ jamSessionId, queue }) => {
      console.log(`📝 Jam queue updated: ${jamSessionId}`);
      socket.to(`jam:${jamSessionId}`).emit("jam:queue_updated", { queue });
    });

    // Chat handlers (coming in Day 9)
    socket.on("join:chat", (conversationId) => {
      socket.join(`chat:${conversationId}`);
      console.log(`Socket ${socket.id} joined chat:`, conversationId);
    });

    socket.on("leave:chat", (conversationId) => {
      socket.leave(`chat:${conversationId}`);
      console.log(`Socket ${socket.id} left chat:`, conversationId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
