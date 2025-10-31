import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { useJam } from "../../contexts/JamContext";
import { useAuth } from "../../hooks/useAuth";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

const MiniPlayer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentJamSession, emitPlay, emitPause, emitSongChange, emitSeek } =
    useJam();
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    togglePlaying,
    playNext,
    playPrevious,
    seek,
    queue,
  } = usePlayerContext();

  // Check if user is in a jam session and is NOT the host
  // Note: host has _id, but user has id (from auth response)
  const isInJamSession = !!currentJamSession;
  const isHostInJam =
    currentJamSession &&
    (currentJamSession.host?._id === user?.id ||
      currentJamSession.host?._id === user?._id ||
      currentJamSession.host?.id === user?.id);
  const isParticipantInJam = isInJamSession && !isHostInJam;

  // Debug logging
  console.log("🎮 MiniPlayer Detection:", {
    isInJamSession,
    isHostInJam,
    isParticipantInJam,
    hostId: currentJamSession?.host?._id,
    hostIdAlt: currentJamSession?.host?.id,
    userId: user?.id,
    userIdAlt: user?._id,
  });

  // If no song is playing, don't show the mini player
  if (!currentSong) return null;

  // Handler for play/pause - emits to jam if host
  const handleTogglePlay = () => {
    console.error("🔴🔴🔴 MINIPLAYER BUTTON CLICKED! 🔴🔴🔴");
    console.log("🔴 MINIPLAYER BUTTON CLICKED!", {
      isParticipantInJam,
      isHostInJam,
      isInJamSession,
      currentJamSession: !!currentJamSession,
      user: !!user,
    });

    // CRITICAL: Block participants from controlling playback
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Playback control blocked");
      return;
    }

    console.log("🎵 MINIPLAYER: togglePlaying called", {
      isInJamSession,
      isHostInJam,
      isParticipantInJam,
      isPlaying,
    });

    // Store the current playing state BEFORE toggling
    const wasPlaying = isPlaying;

    console.log("🔍 MINIPLAYER: After toggle, checking host status:", {
      isHostInJam,
      hasEmitPlay: !!emitPlay,
      hasEmitPause: !!emitPause,
    });

    // If host in jam, emit event based on the state BEFORE toggle
    if (isHostInJam) {
      if (wasPlaying) {
        // Pausing - toggle immediately, no delay needed
        togglePlaying();
        console.error("🎵🎵🎵 MINIPLAYER HOST: EMITTING PAUSE 🎵🎵🎵");
        console.log("🎵 MINIPLAYER HOST: Emitting pause");
        emitPause(position);
      } else {
        // Resuming playback - emit song_change first to ensure participant has song loaded
        const songId = currentSong?._id || currentSong?.songId;
        console.error(
          "🎵🎵🎵 MINIPLAYER HOST: EMITTING PLAY (with 1s delay) 🎵🎵🎵"
        );
        console.log("🎵 MINIPLAYER HOST: Emitting play with sync delay");

        // Emit song_change to ensure participant has the correct song loaded
        emitSongChange(songId);

        // Then emit play
        emitPlay(songId, position);

        // Wait 1 second before starting playback locally
        setTimeout(() => {
          console.log("▶️ MINIPLAYER HOST: Starting playback after sync delay");
          togglePlaying();
        }, 1000);
      }
    } else {
      console.error(
        "⚠️⚠️⚠️ MINIPLAYER: NOT EMITTING - isHostInJam is FALSE! ⚠️⚠️⚠️"
      );
      console.warn("⚠️ MINIPLAYER: Not emitting - isHostInJam is false!");
    }
  };

  // Handler for next song - emits to jam if host
  const handlePlayNext = () => {
    // CRITICAL: Block participants from controlling playback
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Next song control blocked");
      return;
    }

    playNext();

    // If host in jam, emit event after a delay to let currentSong update
    if (isHostInJam) {
      setTimeout(() => {
        const nextSong = queue[1]; // After playNext, queue[1] becomes queue[0]
        if (nextSong) {
          console.log(
            "🎵 MINIPLAYER HOST: Emitting song change (next):",
            nextSong.title
          );
          emitSongChange(nextSong._id || nextSong.songId);
          emitPlay(nextSong._id || nextSong.songId, 0);
        }
      }, 100);
    }
  };

  // Handler for previous song - emits to jam if host
  const handlePlayPrevious = () => {
    // CRITICAL: Block participants from controlling playback
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Previous song control blocked");
      return;
    }

    playPrevious();

    // If host in jam, emit event after a delay to let currentSong update
    if (isHostInJam) {
      setTimeout(() => {
        console.log(
          "🎵 MINIPLAYER HOST: Emitting song change (prev):",
          currentSong?.title
        );
        emitSongChange(currentSong?._id || currentSong?.songId);
        emitPlay(currentSong?._id || currentSong?.songId, 0);
      }, 100);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    // CRITICAL: Block participants from seeking
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Seek control blocked");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;

    console.log("🎵 MINIPLAYER: Seeking to:", newTime, "seconds");

    // If host in jam, emit first then seek locally after delay
    if (isHostInJam) {
      console.log("🎵 MINIPLAYER HOST: Emitting seek event (with 1s delay)");
      emitSeek(newTime);

      // Wait 1 second before seeking locally to sync with participants
      setTimeout(() => {
        console.log("⏩ MINIPLAYER HOST: Seeking locally after sync delay");
        seek(newTime);
      }, 1000);
    } else {
      // Not in jam, seek immediately
      seek(newTime);
    }
  };

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-lg border-t border-white/10 z-40">
      {/* Participant Mode Banner */}
      {isParticipantInJam && (
        <div className="px-4 py-1 bg-white/10 border-b border-white/10">
          <p className="text-white/70 text-xs text-center">
            🎵 In Jam Session - Host controls playback
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={`h-1 bg-white/20 transition-all ${
          isParticipantInJam
            ? "cursor-not-allowed"
            : "cursor-pointer group hover:h-1.5"
        }`}
        onClick={isParticipantInJam ? undefined : handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 relative transition-all"
          style={{ width: `${progressPercent}%` }}
        >
          {!isParticipantInJam && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
          )}
        </div>
      </div>

      {/* Player Content */}
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Song Info */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => navigate("/now-playing")}
        >
          {/* Cover Art */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {currentSong.title?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Song Details */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {currentSong.title || "Unknown Title"}
            </p>
            <p className="text-white/60 text-xs truncate">
              {currentSong.artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Time Display */}
          <span className="text-white/60 text-xs tabular-nums">
            {formatTime(position)} / {formatTime(duration)}
          </span>

          {/* Previous Button */}
          <button
            onClick={isParticipantInJam ? undefined : handlePlayPrevious}
            disabled={isParticipantInJam}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
              isParticipantInJam
                ? "text-white/30 cursor-not-allowed pointer-events-none opacity-50"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
            title={isParticipantInJam ? "Host controls playback" : "Previous"}
          >
            <SkipBack size={18} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={isParticipantInJam ? undefined : handleTogglePlay}
            disabled={isParticipantInJam}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-transform ${
              isParticipantInJam
                ? "bg-white/30 text-purple-900/50 cursor-not-allowed pointer-events-none opacity-50"
                : "bg-white text-purple-900 hover:scale-105"
            }`}
            title={
              isParticipantInJam
                ? "Host controls playback"
                : isPlaying
                ? "Pause"
                : "Play"
            }
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={isParticipantInJam ? undefined : handlePlayNext}
            disabled={isParticipantInJam}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
              isParticipantInJam
                ? "text-white/30 cursor-not-allowed pointer-events-none opacity-50"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
            title={isParticipantInJam ? "Host controls playback" : "Next"}
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
