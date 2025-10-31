// src/components/player/FullPlayer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../hooks/usePlayer";
import { useJam } from "../../contexts/JamContext";
import { useAuth } from "../../hooks/useAuth";
import SongOptionsMenu from "../song/SongOptionsMenu";
import CommentsOverlay from "../comments/CommentsOverlay";
import JamRequestDialog from "../jam/JamRequestDialog";
import LyricsView from "./LyricsView";
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
    setVolume,
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
  const [showJam, setShowJam] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [volume, setLocalVolume] = useState(1);
  const seekRef = useRef(null);

  useEffect(() => {
    setLocalVolume(1);
  }, [currentSong?.songId]);

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
  function handleTogglePlay() {
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Play/Pause blocked (FullPlayer)");
      return;
    }
    togglePlaying();
  }

  // Block participants from next
  function handlePlayNext() {
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Next song blocked (FullPlayer)");
      return;
    }
    playNext();
  }

  // Block participants from previous
  function handlePlayPrevious() {
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Previous song blocked (FullPlayer)");
      return;
    }
    playPrevious();
  }

  function onVolumeChange(e) {
    if (isParticipantInJam) {
      console.log("🚫 PARTICIPANT: Volume control blocked");
      return;
    }
    const v = Number(e.target.value);
    setLocalVolume(v);
    try {
      setVolume?.(v);
    } catch (err) {
      // fallback: call playerService
      playerService.setVolume?.(v);
    }
  }

  return (
    <div className="min-h-screen p-4 pb-32 bg-white">
      {/* Participant Mode Banner */}
      {isParticipantInJam && (
        <div className="max-w-md mx-auto mb-4 px-4 py-3 bg-indigo-100 border border-indigo-300 rounded-lg">
          <p className="text-indigo-900 text-sm text-center font-medium">
            🎵 In Jam Session - Host controls playback
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="rounded-lg overflow-hidden shadow">
          <div className="bg-gray-200 w-full h-80 flex items-center justify-center">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">♪</div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-xl font-semibold truncate">
                  {currentSong.title}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {currentSong.artist}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowComments(true)}
                  className="text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  💬 Comments
                </button>
                <button
                  onClick={() => setShowOptions((s) => !s)}
                  className="text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  ⋮
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div
                ref={seekRef}
                className={`w-full h-2 bg-gray-200 rounded relative ${
                  isParticipantInJam
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={isParticipantInJam ? undefined : handleSeek}
              >
                <div
                  className="h-2 bg-indigo-600 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <div>{formatTime(position)}</div>
                <div>{formatTime(duration)}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-6">
              <button
                onClick={handlePlayPrevious}
                disabled={isParticipantInJam}
                className={`p-3 rounded-full ${
                  isParticipantInJam
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
                title={
                  isParticipantInJam ? "Host controls playback" : "Previous"
                }
              >
                ⏮️
              </button>
              <button
                onClick={handleTogglePlay}
                disabled={isParticipantInJam}
                className={`p-4 rounded-full shadow ${
                  isParticipantInJam
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white"
                }`}
                title={
                  isParticipantInJam
                    ? "Host controls playback"
                    : isPlaying
                    ? "Pause"
                    : "Play"
                }
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <button
                onClick={handlePlayNext}
                disabled={isParticipantInJam}
                className={`p-3 rounded-full ${
                  isParticipantInJam
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
                title={isParticipantInJam ? "Host controls playback" : "Next"}
              >
                ⏭️
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">Volume</div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={isParticipantInJam ? undefined : onVolumeChange}
                  disabled={isParticipantInJam}
                  className={`w-40 ${
                    isParticipantInJam ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title={
                    isParticipantInJam
                      ? "Host controls volume"
                      : "Adjust volume"
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLyrics((s) => !s)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Lyrics
                </button>
                <button
                  onClick={() => setShowJam(true)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                >
                  Play with Friends
                </button>
              </div>
            </div>

            {showLyrics && <LyricsView song={currentSong} />}

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
      <JamRequestDialog
        open={showJam}
        onClose={() => setShowJam(false)}
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
