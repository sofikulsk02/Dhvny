import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "../hooks/useAuth";
import * as jamApi from "../api/jam.api";

const JamContext = createContext(null);

export const useJam = () => {
  const context = useContext(JamContext);
  if (!context) {
    throw new Error("useJam must be used within JamProvider");
  }
  return context;
};

export const JamProvider = ({ children }) => {
  const [currentJamSession, setCurrentJamSession] = useState(null);
  const [jamSessions, setJamSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Debug: Log socket status changes
  useEffect(() => {
    console.log("🔌 JamContext: Socket status changed", {
      hasSocket: !!socket,
      socketConnected: socket?.connected,
      socketId: socket?.id,
    });
  }, [socket]);

  // Create a new jam session
  const createSession = useCallback(
    async (name, isPublic = false) => {
      if (!user) return null;

      try {
        setLoading(true);
        const response = await jamApi.createJamSession({
          name,
          isPublic,
          maxParticipants: 10,
        });

        if (response.success) {
          setCurrentJamSession(response.jamSession);

          // Join the Socket.IO room
          console.log("🔌 HOST: About to join Socket.IO room", {
            hasSocket: !!socket,
            socketConnected: socket?.connected,
            sessionId: response.jamSession._id,
          });

          if (socket) {
            console.log(
              "✅ HOST: Emitting join:jam to room:",
              response.jamSession._id
            );
            socket.emit("join:jam", response.jamSession._id);
          } else {
            console.warn("⚠️ HOST: Socket not available for creating jam room");
          }

          return response.jamSession;
        }
      } catch (error) {
        console.error("Failed to create jam session:", error);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [user, socket]
  );

  // Fetch all available jam sessions
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await jamApi.getJamSessions();
      if (response.success) {
        setJamSessions(response.jamSessions);
      }
    } catch (error) {
      console.error("Failed to fetch jam sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Join an existing jam session
  const joinSession = useCallback(
    async (sessionId) => {
      if (!user) return null;

      try {
        setLoading(true);
        const response = await jamApi.joinJamSession(sessionId);

        console.log("🎯 Join session API response:", response);
        console.log("🎯 Jam session host:", response.jamSession?.host);

        if (response.success) {
          setCurrentJamSession(response.jamSession);

          // Join the Socket.IO room
          console.log("🔌 About to join Socket.IO room", {
            hasSocket: !!socket,
            socketConnected: socket?.connected,
            sessionId,
          });

          if (socket) {
            console.log("✅ Emitting join:jam to room:", sessionId);
            socket.emit("join:jam", sessionId);
            socket.emit("jam:participant_joined", {
              jamSessionId: sessionId,
              user: {
                _id: user.id, // Fixed: use user.id not user._id
                displayName: user.displayName,
                avatar: user.avatar,
              },
            });
          } else {
            console.warn("⚠️ Socket not available for joining jam room");
          }

          return response.jamSession;
        }
      } catch (error) {
        console.error("Failed to join jam session:", error);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [user, socket]
  );

  // Leave current jam session
  const leaveSession = useCallback(async () => {
    if (!currentJamSession || !user) return;

    try {
      const sessionId = currentJamSession._id;
      await jamApi.leaveJamSession(sessionId);

      // Leave the Socket.IO room
      if (socket) {
        socket.emit("jam:participant_left", {
          jamSessionId: sessionId,
          userId: user._id,
        });
        socket.emit("leave:jam", sessionId);
      }

      setCurrentJamSession(null);
    } catch (error) {
      console.error("Failed to leave jam session:", error);
    }
  }, [currentJamSession, user, socket]);

  // End jam session (host only)
  const endSession = useCallback(async () => {
    if (!currentJamSession || !user) return;

    try {
      await jamApi.endJamSession(currentJamSession._id);

      if (socket) {
        socket.emit("leave:jam", currentJamSession._id);
      }

      setCurrentJamSession(null);
    } catch (error) {
      console.error("Failed to end jam session:", error);
    }
  }, [currentJamSession, user, socket]);

  // Add song to queue
  const addToQueue = useCallback(
    async (songId) => {
      if (!currentJamSession) return;

      try {
        const response = await jamApi.addSongToJamQueue(
          currentJamSession._id,
          songId
        );

        if (response.success && socket) {
          socket.emit("jam:queue_updated", {
            jamSessionId: currentJamSession._id,
            queue: response.queue,
          });
        }

        return response.success;
      } catch (error) {
        console.error("Failed to add to queue:", error);
        return false;
      }
    },
    [currentJamSession, socket]
  );

  // Emit playback events
  const emitPlay = useCallback(
    (songId, position = 0) => {
      console.log("🔊 emitPlay called - checking prerequisites...", {
        hasSession: !!currentJamSession,
        hasSocket: !!socket,
        socketConnected: socket?.connected,
        songId,
        position,
      });

      if (!currentJamSession || !socket) {
        console.warn("⚠️ Cannot emit play - missing jam session or socket");
        return;
      }

      console.log("🔊 JamContext: Emitting jam:play", {
        jamSessionId: currentJamSession._id,
        songId,
        position,
      });

      socket.emit("jam:play", {
        jamSessionId: currentJamSession._id,
        songId,
        position,
      });
    },
    [currentJamSession, socket]
  );

  const emitPause = useCallback(
    (position) => {
      if (!currentJamSession || !socket) {
        console.warn("⚠️ Cannot emit pause - missing jam session or socket");
        return;
      }

      console.log("🔊 JamContext: Emitting jam:pause", {
        jamSessionId: currentJamSession._id,
        position,
      });

      socket.emit("jam:pause", {
        jamSessionId: currentJamSession._id,
        position,
      });
    },
    [currentJamSession, socket]
  );

  const emitSeek = useCallback(
    (position) => {
      if (!currentJamSession || !socket) return;

      socket.emit("jam:seek", {
        jamSessionId: currentJamSession._id,
        position,
      });
    },
    [currentJamSession, socket]
  );

  const emitSongChange = useCallback(
    (songId) => {
      console.log("🔊 emitSongChange called - checking prerequisites...", {
        hasSession: !!currentJamSession,
        hasSocket: !!socket,
        socketConnected: socket?.connected,
        songId,
      });

      if (!currentJamSession || !socket) {
        console.warn(
          "⚠️ Cannot emit song change - missing jam session or socket"
        );
        return;
      }

      console.log("🔊 JamContext: Emitting jam:song_change", {
        jamSessionId: currentJamSession._id,
        songId,
      });

      socket.emit("jam:song_change", {
        jamSessionId: currentJamSession._id,
        songId,
      });
    },
    [currentJamSession, socket]
  );

  // Listen for Socket.IO events
  useEffect(() => {
    if (!socket || !currentJamSession) return;

    const handlePlay = ({ songId, position }) => {
      console.log("🎵 Received jam play event:", songId, position);
      // PlayerContext will handle this via custom event
      window.dispatchEvent(
        new CustomEvent("jam:play", { detail: { songId, position } })
      );
    };

    const handlePause = ({ position }) => {
      console.log("⏸️ Received jam pause event:", position);
      window.dispatchEvent(
        new CustomEvent("jam:pause", { detail: { position } })
      );
    };

    const handleSeek = ({ position }) => {
      console.log("⏩ Received jam seek event:", position);
      window.dispatchEvent(
        new CustomEvent("jam:seek", { detail: { position } })
      );
    };

    const handleSongChange = ({ songId }) => {
      console.log("🎶 Received jam song change:", songId);
      window.dispatchEvent(
        new CustomEvent("jam:song_change", { detail: { songId } })
      );
    };

    const handleParticipantJoined = ({ user: newUser }) => {
      console.log("👋 Participant joined:", newUser.displayName);
      setCurrentJamSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: [
            ...prev.participants,
            { user: newUser, joinedAt: new Date() },
          ],
        };
      });
    };

    const handleParticipantLeft = ({ userId }) => {
      console.log("👋 Participant left:", userId);
      setCurrentJamSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.user._id !== userId),
        };
      });
    };

    const handleQueueUpdated = ({ queue }) => {
      console.log("📝 Queue updated");
      setCurrentJamSession((prev) => {
        if (!prev) return prev;
        return { ...prev, queue };
      });
    };

    socket.on("jam:play", handlePlay);
    socket.on("jam:pause", handlePause);
    socket.on("jam:seek", handleSeek);
    socket.on("jam:song_change", handleSongChange);
    socket.on("jam:participant_joined", handleParticipantJoined);
    socket.on("jam:participant_left", handleParticipantLeft);
    socket.on("jam:queue_updated", handleQueueUpdated);

    return () => {
      socket.off("jam:play", handlePlay);
      socket.off("jam:pause", handlePause);
      socket.off("jam:seek", handleSeek);
      socket.off("jam:song_change", handleSongChange);
      socket.off("jam:participant_joined", handleParticipantJoined);
      socket.off("jam:participant_left", handleParticipantLeft);
      socket.off("jam:queue_updated", handleQueueUpdated);
    };
  }, [socket, currentJamSession]);

  const value = {
    currentJamSession,
    jamSessions,
    loading,
    createSession,
    fetchSessions,
    joinSession,
    leaveSession,
    endSession,
    addToQueue,
    emitPlay,
    emitPause,
    emitSeek,
    emitSongChange,
  };

  return <JamContext.Provider value={value}>{children}</JamContext.Provider>;
};
