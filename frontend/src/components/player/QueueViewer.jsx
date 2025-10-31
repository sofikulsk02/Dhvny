// src/components/player/QueueViewer.jsx
import React, { useCallback } from "react";
import { usePlayer } from "../../hooks/usePlayer";
import playerService from "../../services/player.services";

/**
 * QueueViewer
 *
 * Simple visual queue component for debugging / dev / UI.
 * - Shows full queue
 * - Highlights currentSong
 * - Buttons: Play (jump), Remove, Move up, Move down
 *
 * Usage:
 * <QueueViewer compact={false} />
 *
 * Note: this component calls playerService methods directly for move/remove operations.
 */

function IconPlaySmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
    </svg>
  );
}

function IconPauseSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconUp() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5l-7 7h14l-7-7z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19l7-7H5l7 7z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function QueueViewer({ compact = false }) {
  const {
    queue = [],
    currentIndex = -1,
    isPlaying,
    togglePlaying,
    playNext,
    playPrevious,
    getQueueLength,
  } = usePlayer();

  const handleJumpTo = useCallback(
    (idx) => {
      const item = queue[idx];
      if (!item) return;

      // If clicking on current song, toggle play/pause
      if (idx === currentIndex) {
        togglePlaying();
        return;
      }

      // Otherwise, jump to that song
      playerService.setCurrentIndex(idx);
      playerService.setPlaying(true);
    },
    [queue, currentIndex, togglePlaying]
  );

  const handleRemove = useCallback((idx) => {
    const item = queue[idx];
    if (!item) return;
    playerService.removeFromQueueByIndex?.(idx) ??
      playerService.removeFromQueueBySongId(item.songId || item.id);
  }, []);

  const handleMove = useCallback((fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    playerService.moveInQueue(fromIdx, toIdx);
  }, []);

  if (!queue || queue.length === 0) {
    return (
      <div
        className={`p-3 rounded bg-gray-50 text-sm text-gray-500 ${
          compact ? "text-xs" : ""
        }`}
      >
        Queue is empty
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-full p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 ${
        compact ? "text-sm" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg sm:text-xl text-gray-900">
          Queue ({getQueueLength()})
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {currentIndex >= 0
            ? `Now: ${currentIndex + 1}/${queue.length}`
            : `${queue.length} songs`}
        </div>
      </div>

      <ul className="space-y-2 max-h-96 overflow-auto">
        {queue.map((s, idx) => {
          const isCur = idx === currentIndex;
          return (
            <li
              key={s.songId ?? s.id ?? `${idx}`}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isCur
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100"
              } `}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-gray-400 shrink-0">
                  {s.coverUrl ? (
                    <img
                      src={s.coverUrl}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate font-semibold text-sm sm:text-base text-gray-900"
                    title={s.title}
                  >
                    {s.title}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">
                    {s.artist ?? "Unknown Artist"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                <button
                  type="button"
                  onClick={() => handleJumpTo(idx)}
                  title={isCur ? (isPlaying ? "Pause" : "Play") : "Play this"}
                  className={`p-2 rounded-lg hover:bg-white transition-colors ${
                    isCur ? "bg-purple-100 text-purple-600" : "text-gray-600"
                  }`}
                >
                  {isCur && isPlaying ? <IconPauseSmall /> : <IconPlaySmall />}
                </button>

                <button
                  type="button"
                  onClick={() => handleMove(idx, Math.max(0, idx - 1))}
                  title="Move up"
                  className="p-2 rounded-lg hover:bg-white transition-colors text-gray-600"
                  disabled={idx === 0}
                >
                  <IconUp />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleMove(idx, Math.min(queue.length - 1, idx + 1))
                  }
                  title="Move down"
                  className="p-2 rounded-lg hover:bg-white transition-colors text-gray-600"
                  disabled={idx === queue.length - 1}
                >
                  <IconDown />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Remove"
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <IconTrash />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => playPrevious()}
            className="px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
            title="Previous"
          >
            ⏮ Prev
          </button>
          <button
            type="button"
            onClick={() => playNext()}
            className="px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
            title="Next"
          >
            Next ⏭
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to clear the entire queue?"
                )
              ) {
                playerService.clearQueue();
              }
            }}
            className="px-3 sm:px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors"
            title="Clear queue"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// QueueViewer.propTypes = {
//   compact: PropTypes.bool,
// };
