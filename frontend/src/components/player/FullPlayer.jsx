// src/components/player/FullPlayer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../hooks/usePlayer";
import { useJam } from "../../contexts/JamContext";
import { useAuth } from "../../hooks/useAuth";
import SongOptionsMenu from "../song/SongOptionsMenu";
import CommentsOverlay from "../comments/CommentsOverlay";
import playerService from "../../services/player.services";

/**
 * FullPlayer - full-screen player UI for NowPlayingPage or route /now-playing
 */
export default function FullPlayer() {
  const { user } = useAuth();
  const { currentJamSession } = useJam();
  const {
    currentSong,
    isPlaying,
    togglePlaying,
    playNext,
    playPrevious,
    position,
    duration,
    seek,
  } = usePlayer();

  // Check if user is a participant (not host) in a jam session
  const isInJamSession = !!currentJamSession;
  const isHostInJam =
    currentJamSession &&
    (currentJamSession.host?._id === user?.id ||
      currentJamSession.host?._id === user?._id ||
      currentJamSession.host?.id === user?.id);
  const isParticipantInJam = isInJamSession && !isHostInJam;

  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const seekRef = useRef(null);

  if (!currentSong) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center text-gray-500">
        No song playing — open Home or Collections to start.
      </div>
    );
  }

  const progress = duration
    ? Math.min(100, ((position || 0) / Math.max(1, duration)) * 100)
    : 0;

  // Block participants from seeking
  function handleSeek(e) {
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Seek control blocked (FullPlayer)");
      return;
    }

    const rect = seekRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newTime = Math.round(pct * duration);
    seek(newTime);
  }

  // Block participants from play/pause
  function handleTogglePlay(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Play/Pause blocked (FullPlayer)");
      return;
    }
    console.log("🎵 FullPlayer: Toggle play clicked");
    togglePlaying();
  }

  // Block participants from next
  function handlePlayNext(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Next song blocked (FullPlayer)");
      return;
    }
    console.log("⏭️ FullPlayer: Play next clicked");
    playNext();
  }

  // Block participants from previous
  function handlePlayPrevious(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Previous song blocked (FullPlayer)");
      return;
    }
    console.log("⏮️ FullPlayer: Play previous clicked");
    playPrevious();
  }

  return (
    <div className="min-h-screen p-3 pb-16 bg-gradient-to-b from-gray-900 to-black dark:from-gray-900 dark:to-black">
      {/* Participant Mode Banner */}
      {isParticipantInJam && (
        <div className="max-w-md mx-auto mb-3 px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-lg">
          <p className="text-indigo-900 text-sm text-center font-medium">
            🎵 In Jam Session - Host controls playback
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
          <div className="bg-gray-200 w-full aspect-square flex items-center justify-center">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-6xl">♪</div>
            )}
          </div>

          <div className="p-4 bg-gray-800">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-bold text-white truncate">
                  {currentSong.title}
                </div>
                <div className="text-base text-gray-300 truncate mt-1">
                  {currentSong.artist}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setShowComments(true)}
                  className="text-sm text-white bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  💬 Comments
                </button>
                <button
                  onClick={() => setShowOptions((s) => !s)}
                  className="text-sm text-white bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ⋮
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div
                ref={seekRef}
                className={`w-full h-3 bg-gray-700 rounded-full relative ${
                  isParticipantInJam
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={isParticipantInJam ? undefined : handleSeek}
              >
                <div
                  className="h-3 bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <div>{formatTime(position)}</div>
                <div>{formatTime(duration)}</div>
              </div>
            </div>

            <div className="mt-6 mb-2 flex items-center justify-center space-x-8">
              <button
                type="button"
                onClick={handlePlayPrevious}
                disabled={isParticipantInJam}
                className={`p-4 rounded-full bg-gray-700 text-white transition-all ${
                  isParticipantInJam
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-gray-600 hover:scale-110 active:scale-95"
                }`}
                title={
                  isParticipantInJam ? "Host controls playback" : "Previous"
                }
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleTogglePlay}
                disabled={isParticipantInJam}
                className={`p-6 rounded-full shadow-2xl transition-all ${
                  isParticipantInJam
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-110 active:scale-95"
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
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
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
                type="button"
                onClick={handlePlayNext}
                disabled={isParticipantInJam}
                className={`p-4 rounded-full bg-gray-700 text-white transition-all ${
                  isParticipantInJam
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-gray-600 hover:scale-110 active:scale-95"
                }`}
                title={isParticipantInJam ? "Host controls playback" : "Next"}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {showOptions && (
              <div className="absolute right-4 top-24">
                <SongOptionsMenu
                  song={currentSong}
                  onClose={() => setShowOptions(false)}
                  onOpenComments={() => setShowComments(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <CommentsOverlay
        visible={showComments}
        onClose={() => setShowComments(false)}
        song={currentSong}
      />
    </div>
  );
}

function formatTime(sec) {
  if (!sec && sec !== 0) return "--:--";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
