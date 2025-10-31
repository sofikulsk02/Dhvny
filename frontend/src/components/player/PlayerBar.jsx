import React, { useCallback } from "react";
import { usePlayer } from "../../hooks/usePlayer";
import SongCard from "../song/SongCard";

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 4l12 8-12 8V4z" fill="currentColor" />
    </svg>
  );
}

function IconPrev() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 4L7 12l12 8V4z" fill="currentColor" />
    </svg>
  );
}

export default function PlayerBar() {
  const { currentSong, isPlaying, togglePlaying, playNext, playPrevious } =
    usePlayer();

  const handleTogglePlay = useCallback(() => {
    togglePlaying?.();
  }, [togglePlaying]);

  if (!currentSong) return null; // Hide bar if no song

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg z-50">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Song info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-white/20 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white/50 text-lg">♪</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm">
              {currentSong.title}
            </div>
            <div className="text-xs text-white/70 truncate">
              {currentSong.artist || "Unknown"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={playPrevious}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Previous"
          >
            <IconPrev />
          </button>
          <button
            onClick={handleTogglePlay}
            className="p-2.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button
            onClick={playNext}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Next"
          >
            <IconNext />
          </button>
        </div>
      </div>
    </div>
  );
}
