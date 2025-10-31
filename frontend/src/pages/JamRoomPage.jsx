import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJam } from "../contexts/JamContext";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { listSongs } from "../api/songs.api";

export default function JamRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentJamSession,
    joinSession,
    leaveSession,
    endSession,
    loading,
    emitPlay,
    emitPause,
    emitSongChange,
    emitSeek,
  } = useJam();
  const {
    currentSong,
    isPlaying,
    queue,
    togglePlaying,
    playNext,
    playPrevious,
    setQueue,
    setCurrentIndex,
    setCurrentBySongId,
    setPlaying,
    position,
    duration,
    seek,
  } = usePlayer();
  const [isHost, setIsHost] = useState(false);
  const [allSongsLoaded, setAllSongsLoaded] = useState(false);

  // Load all available songs into the jam queue
  useEffect(() => {
    const loadAllSongs = async () => {
      try {
        console.log("🎵 Loading all songs for jam session...");
        // Fetch all songs (use includeAll=true to get all songs regardless of public/approved status)
        const response = await listSongs({
          page: 1,
          perPage: 1000,
          includeAll: true,
        });
        console.log("📦 API Response:", response);

        const songs = response.songs || response.items || response.data || [];

        console.log(`✅ Loaded ${songs.length} songs for jam queue`, songs);

        // Set queue with all available songs
        if (songs.length > 0) {
          setQueue(songs);
          setAllSongsLoaded(true);
        } else {
          console.warn("⚠️ No songs available in the app");
        }
      } catch (error) {
        console.error("❌ Failed to load songs for jam:", error);
      }
    };

    // Load songs once when component mounts
    if (!allSongsLoaded && currentJamSession) {
      loadAllSongs();
    }
  }, [currentJamSession, allSongsLoaded, setQueue]);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    // If not in this session, join it
    if (!currentJamSession || currentJamSession._id !== sessionId) {
      joinSession(sessionId);
    }
    // Note: Queue is loaded separately by the loadAllSongs effect above
    // We don't sync queue from jam session because we want all available songs
  }, [sessionId, user, currentJamSession, joinSession, navigate]);

  useEffect(() => {
    if (currentJamSession && user) {
      console.log("📊 Full jam session data:", currentJamSession);
      console.log("👤 Current user:", user);
      console.log("👤 User ID:", user?.id, "Type:", typeof user?.id);

      const hostCheck =
        currentJamSession.host?._id === user?.id ||
        currentJamSession.host?._id === user?._id ||
        currentJamSession.host?.id === user?.id;
      console.log("🔐 Host check:", {
        hostId: currentJamSession.host?._id,
        hostIdAlt: currentJamSession.host?.id,
        hostObject: currentJamSession.host,
        userId: user?.id,
        userIdAlt: user?._id,
        isHost: hostCheck,
      });
      setIsHost(hostCheck);
    } else {
      console.warn("⚠️ Missing data:", {
        hasJamSession: !!currentJamSession,
        hasUser: !!user,
        user,
      });
    }
  }, [currentJamSession, user]);

  // Sync playback events from host
  const handleTogglePlay = () => {
    console.log("🎵 handleTogglePlay called", {
      isHost,
      isPlaying,
      currentSong: currentSong?.title,
    });

    if (!isHost) return; // Only host can control

    const wasPlaying = isPlaying;

    if (wasPlaying) {
      // Pausing - no delay needed
      togglePlaying();
      console.log("🎵 HOST: Emitting pause event");
      console.error("🔴 HOST PAUSING - EMITTING TO SERVER");
      emitPause(position);
    } else {
      // Resuming playback - emit song_change first to ensure participant has song loaded
      const songId = currentSong?._id || currentSong?.songId;
      console.log("🎵 HOST: Emitting play event (with 1s delay)", {
        songId,
        position,
      });
      console.error("🔴 HOST PLAYING - EMITTING TO SERVER", {
        songId,
        position,
      });

      // Emit song_change to ensure participant has the correct song loaded
      emitSongChange(songId);

      // Then emit play
      emitPlay(songId, position);

      // Wait 1 second before starting playback locally
      // This gives participants time to receive the message and sync
      setTimeout(() => {
        console.log("▶️ HOST: Starting playback after sync delay");
        togglePlaying();
      }, 1000);
    }
  };

  const handlePlayNext = () => {
    console.log("🎵 handlePlayNext called", { isHost, queue });

    if (!isHost) return; // Only host can control

    playNext();

    // Wait a bit for the player to update currentSong, then emit
    setTimeout(() => {
      if (queue && queue.length > 1) {
        // Get the next song (should be the new currentSong after playNext)
        const nextSong = queue[1]; // Index 1 because queue[0] is current
        if (nextSong) {
          const songId = nextSong._id || nextSong.songId;
          console.log(
            "🎵 HOST: Emitting next song change:",
            nextSong.title,
            songId
          );
          emitSongChange(songId);
        }
      }
    }, 100);
  };

  const handlePlayPrevious = () => {
    console.log("🎵 handlePlayPrevious called", { isHost });

    if (!isHost) return; // Only host can control

    playPrevious();

    // Wait for player to update, then emit the previous song
    setTimeout(() => {
      if (currentSong) {
        const songId = currentSong._id || currentSong.songId;
        console.log(
          "🎵 HOST: Emitting previous song change:",
          currentSong.title,
          songId
        );
        emitSongChange(songId);
      }
    }, 100);
  };

  // Play a specific song from the queue (host only)
  const handlePlaySong = (song, songIndex) => {
    console.log("🎵 handlePlaySong called", { song, songIndex, isHost });

    if (!isHost) {
      console.warn("Not host, cannot play song");
      return;
    }

    console.log("✅ HOST: Playing song:", song.title, "ID:", song._id);

    // Load the song first WITHOUT playing
    setCurrentBySongId(song._id);

    // Wait for the song to load, then start playback and emit
    setTimeout(() => {
      const songId = song._id || song.songId;

      console.log("▶️ HOST: Starting playback after load");

      // Now set playing state after audio has loaded
      setPlaying(true);

      console.log("� HOST: Emitting events to participants", {
        songId,
        songTitle: song.title,
      });

      // Emit song change to update participants' UI
      emitSongChange(songId);

      // Emit play event to start playback on participants
      emitPlay(songId, 0);
    }, 1000); // Wait 2 seconds for audio to fully load before playing
  };

  // Continuous position sync for host (every 500ms while playing)
  useEffect(() => {
    if (!isHost || !isPlaying || !currentSong) return;

    const syncInterval = setInterval(() => {
      const currentPosition = position;

      // Emit seek to keep participants in sync
      // Only sync if we have a valid position
      if (typeof currentPosition === "number" && !isNaN(currentPosition)) {
        emitPlay(currentSong._id || currentSong.songId, currentPosition);
      }
    }, 500); // Sync every 500ms (0.5 seconds) for tight synchronization

    return () => {
      clearInterval(syncInterval);
    };
  }, [isHost, isPlaying, currentSong, position, emitPlay]);

  // Listen for jam playback events and sync local player
  useEffect(() => {
    // Don't set up listeners until jam session AND user are loaded
    if (!currentJamSession || !user) {
      console.log(
        "⏳ Waiting for jam session and user to load before setting up listeners"
      );
      return;
    }

    // Check if current user is the host (use user.id not user._id)
    const isCurrentUserHost = currentJamSession.host?._id === user?.id;

    if (isCurrentUserHost) {
      console.log("👑 User is HOST - not listening for sync events");
      return; // Host doesn't need to listen
    }

    console.log("👂 PARTICIPANT: Setting up sync event listeners");

    const handleJamPlay = async (event) => {
      const { songId, position: pos } = event.detail;

      // If different song, load it using setCurrentBySongId
      if (currentSong?._id !== songId && currentSong?.songId !== songId) {
        console.log("🔄 PARTICIPANT: Switching to song:", songId);

        // Load the song first WITHOUT playing
        setCurrentBySongId(songId);

        // Wait for song to load, then start playing
        setTimeout(() => {
          console.log("▶️ PARTICIPANT: Starting playback after load");
          setPlaying(true);

          // Seek to position if provided
          if (typeof pos === "number" && !isNaN(pos) && pos > 0) {
            setTimeout(() => seek(pos), 100);
          }
        }, 1000); // Reduced to 1 second for faster sync
      } else {
        // Same song, sync position if drift is more than 1 second
        const drift = Math.abs(position - pos);

        if (!isPlaying) {
          // Resume playback
          console.log("▶️ PARTICIPANT: Resuming playback");

          // Wait for audio to be ready (duration must be valid)
          const waitForAudioReady = () => {
            if (duration && !isNaN(duration) && duration > 0) {
              setPlaying(true);

              // Seek to position if provided and drift is significant
              if (typeof pos === "number" && !isNaN(pos) && drift > 1) {
                setTimeout(() => {
                  console.log("⏩ PARTICIPANT: Syncing to position:", pos);
                  seek(pos);
                }, 100);
              }
            } else {
              setTimeout(waitForAudioReady, 300); // Reduced wait time
            }
          };

          setTimeout(waitForAudioReady, 50);
        } else if (drift > 1) {
          // Already playing but drifted too much - resync
          console.log(
            `🔄 PARTICIPANT: Correcting drift of ${drift.toFixed(2)}s`
          );
          seek(pos);
        }
      }
    };

    const handleJamPause = () => {
      console.error("🔴🔴🔴 PARTICIPANT: RECEIVED PAUSE EVENT!");
      console.log("⏸️ PARTICIPANT: Received pause event");
      if (isPlaying) {
        togglePlaying();
      }
    };

    const handleJamSeek = (event) => {
      const { position: pos } = event.detail;
      console.log("⏩ PARTICIPANT: Syncing seek to position:", pos);

      // Seek to the position
      if (typeof pos === "number" && !isNaN(pos)) {
        seek(pos);
      }
    };

    const handleJamSongChange = async (event) => {
      const { songId } = event.detail;
      console.log("🎶 PARTICIPANT: Syncing song change:", songId);

      // Use setCurrentBySongId to load the song from the queue
      setCurrentBySongId(songId);
    };

    window.addEventListener("jam:play", handleJamPlay);
    window.addEventListener("jam:pause", handleJamPause);
    window.addEventListener("jam:seek", handleJamSeek);
    window.addEventListener("jam:song_change", handleJamSongChange);

    return () => {
      window.removeEventListener("jam:play", handleJamPlay);
      window.removeEventListener("jam:pause", handleJamPause);
      window.removeEventListener("jam:seek", handleJamSeek);
      window.removeEventListener("jam:song_change", handleJamSongChange);
    };
  }, [
    user,
    currentSong,
    currentJamSession,
    isPlaying,
    duration,
    togglePlaying,
    setQueue,
    setCurrentIndex,
    setCurrentBySongId,
    setPlaying,
    seek,
  ]);

  const handleLeave = async () => {
    await leaveSession();
    navigate("/jam");
  };

  const handleEnd = async () => {
    await endSession();
    navigate("/jam");
  };

  if (loading || !currentJamSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-500">Loading jam session...</p>
        </div>
      </div>
    );
  }

  const participants = currentJamSession.participants || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={() => navigate("/jam")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-semibold text-lg">{currentJamSession.name}</h1>
          <p className="text-xs text-gray-500">
            {participants.length}{" "}
            {participants.length === 1 ? "person" : "people"}
          </p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Host Badge */}
      {isHost && (
        <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white text-center">
          <p className="text-sm font-medium">🎵 You're the host!</p>
          <p className="text-xs opacity-90 mt-1">
            Your playback controls sync for everyone
          </p>
        </div>
      )}

      {/* Current Song */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Now Playing</h2>
        {currentSong ? (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                {currentSong.coverUrl ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  "🎵"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {currentSong.title}
                </h3>
                <p className="text-gray-600 truncate">{currentSong.artist}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span>{isPlaying ? "⏸️" : "▶️"}</span>
                  <span>{isPlaying ? "Playing" : "Paused"}</span>
                </p>
              </div>
            </div>

            {/* Playback Controls (Host only) */}
            {isHost && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <button
                  onClick={handlePlayPrevious}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Previous"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition-shadow"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={handlePlayNext}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Next"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {!isHost && (
              <p className="text-center text-sm text-gray-500 py-2 border-t">
                Host controls the playback
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-3">🎵</div>
            <p className="text-gray-500">No song playing</p>
            {isHost && (
              <p className="text-sm text-gray-400 mt-2">
                Play a song to start the jam!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Queue */}
      <div className="mx-4 mt-6 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          Available Songs ({queue?.length || 0})
          {isHost && (
            <span className="ml-2 text-xs text-purple-600">
              (Click to play)
            </span>
          )}
        </h2>
        {queue && queue.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm divide-y max-h-96 overflow-y-auto">
            {queue.map((song, index) => (
              <div
                key={song._id || song.songId || index}
                onClick={isHost ? () => handlePlaySong(song, index) : undefined}
                className={`p-3 flex items-center gap-3 ${
                  isHost
                    ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    : "opacity-70 cursor-default"
                } ${
                  currentSong &&
                  (currentSong._id === song._id ||
                    currentSong.songId === song.songId)
                    ? "bg-purple-50 border-l-4 border-purple-600"
                    : ""
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                  {currentSong &&
                  (currentSong._id === song._id ||
                    currentSong.songId === song.songId) ? (
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : isHost ? (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {song.artist}
                  </p>
                </div>
                {isHost && (
                  <span className="text-xs text-purple-600 font-medium">
                    Tap to play
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-400 text-sm">No songs available</p>
            {isHost && (
              <p className="text-xs text-gray-400 mt-1">
                Upload songs to play them in the jam!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="mx-4 mt-6 mb-24">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          Participants ({participants.length})
        </h2>
        <div className="bg-white rounded-xl shadow-sm divide-y max-h-64 overflow-y-auto">
          {participants.map((participant, index) => (
            <div key={index} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-medium flex-shrink-0">
                {participant.user?.displayName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {participant.user?.displayName || "Unknown"}
                  {participant.user?._id === currentJamSession.host?._id && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Host
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Joined{" "}
                  {new Date(participant.joinedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mx-4 mt-6 mb-6 space-y-3">
        <button
          onClick={handleLeave}
          className="w-full py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Leave Session
        </button>

        {isHost && (
          <button
            onClick={handleEnd}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            End Session for Everyone
          </button>
        )}
      </div>
    </div>
  );
}
