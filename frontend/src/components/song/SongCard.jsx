// src/components/song/SongCard.jsx
import React, { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../hooks/usePlayer";
import playerService from "../../services/player.services";
import songsApi from "../../api/songs.api";
import SongOptionsMenu from "./SongOptionsMenu";
import AddToPlaylistModal from "../../modals/AddToPlaylistModal";
import { useAuth } from "../../hooks/useAuth";

/**
 * SongCard
 *
 * Props:
 *  - song: object { songId | id, title, artist, coverUrl, duration, isLegend, liked }
 *  - compact: boolean (renders smaller card)
 *  - showControls: boolean (show play / like / options)
 *  - onOpenComments, onOpenKaraoke, onAddToCollection, onShare: callbacks forwarded to options menu
 *
 * Behavior:
 *  - clicking cover or title plays the song (play now)
 *  - Play button toggles play/pause for this song
 *  - 3-dot opens SongOptionsMenu anchored to the button
 *  - Legend songs show a golden badge
 *
 * Note: styling uses Tailwind utility classes. Replace with your CSS if not using Tailwind.
 */

function IconPlay({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
    </svg>
  );
}
function IconPause({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </svg>
  );
}
function IconHeart({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.35-9-7.2C-0.3 10.3 3 5 7.5 6.6 9.3 7.3 11 9 12 10.2c1-.966 2.7-2.93 4.5-3.6C21 5 24.3 10.3 21 13.8c-2 2.85-9 7.2-9 7.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SongCard({
  song,
  compact = false,
  showControls = true,
  onOpenComments = null,
  onOpenKaraoke = null,
  onAddToCollection = null,
  onShare = null,
  layout = "grid", // "grid" or "list"
}) {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    togglePlaying,
    queue,
    setCurrentBySongId,
    addToQueue,
  } = usePlayer();
  const { user } = useAuth();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [liked, setLiked] = useState(Boolean(song?.liked));
  const [working, setWorking] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const optionsButtonRef = useRef(null);

  const songId = song?.songId ?? song?.id;

  // whether this card's song is the current one playing
  const isCurrent =
    currentSong && (currentSong.songId === songId || currentSong.id === songId);

  const formatDuration = useCallback((d) => {
    if (!d && d !== 0) return "";
    const sec = Number(d) || 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  // Play now: check if song is in queue, if yes just switch to it, otherwise add it
  const handlePlayNow = useCallback(
    (e) => {
      e?.stopPropagation?.();
      try {
        // Check if song is already in queue
        const songInQueue = queue.find(
          (s) => (s.songId || s.id) === (song.songId || song.id)
        );

        if (songInQueue) {
          // Song is in queue, just switch to it
          setCurrentBySongId(song.songId || song.id);
          playerService.setPlaying(true);
        } else {
          // Song not in queue, add it and play
          addToQueue(song);
          // Set it as current (it will be the last one added)
          setTimeout(() => {
            setCurrentBySongId(song.songId || song.id);
            playerService.setPlaying(true);
          }, 50);
        }
      } catch (err) {
        console.error("playNow error", err);
      }
    },
    [song, queue, setCurrentBySongId, addToQueue]
  );

  // Toggle play/pause for this song
  const handleTogglePlay = useCallback(
    (e) => {
      e?.stopPropagation?.();
      // if this is not the currentSong, play it
      if (!isCurrent) {
        handlePlayNow(e);
        return;
      }
      // else toggle the global play state using context function
      togglePlaying();
    },
    [isCurrent, handlePlayNow, togglePlaying]
  );

  // Like/unlike the song (optimistic update)
  const handleToggleLike = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setWorking(true);
      try {
        const newVal = !liked;
        setLiked(newVal);
        await songsApi.likeSong(songId, newVal);
      } catch (err) {
        console.error("like failed", err);
        // rollback
        setLiked((p) => !p);
      } finally {
        setWorking(false);
      }
    },
    [liked, songId]
  );

  const openOptions = useCallback(
    (e) => {
      e?.stopPropagation?.();
      console.log("🔧 Opening options menu for song:", song?.title);
      setOptionsOpen(true);
    },
    [song]
  );

  const closeOptions = useCallback(() => {
    setOptionsOpen(false);
  }, []);

  const handleOpenSongPage = useCallback(
    (e) => {
      e?.stopPropagation?.();
      navigate(`/songs/${encodeURIComponent(songId)}`);
    },
    [navigate, songId]
  );

  return (
    <div
      className={`group relative bg-white rounded-xl hover:shadow-lg transition-all ${
        compact ? "text-sm" : ""
      } ${
        layout === "list"
          ? "flex items-center gap-4 p-4"
          : "flex flex-col shadow-md"
      }`}
      role="article"
      aria-label={`${song.title} - ${song.artist || "Unknown"}`}
    >
      {/* Cover Image */}
      <div
        className={`relative rounded-t-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer shrink-0 ${
          layout === "list" ? "w-16 h-16 rounded-lg" : "w-full"
        }`}
        style={layout === "grid" ? { aspectRatio: "1/1" } : {}}
        onClick={handlePlayNow}
      >
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={`${song.title} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
            ♪
          </div>
        )}

        {/* Play/Pause Button Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
              className={`rounded-full bg-white shadow-lg flex items-center justify-center transform transition-all text-purple-600 ${
                layout === "list"
                  ? "w-10 h-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  : "w-12 h-12 sm:w-14 sm:h-14 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-hover:scale-110"
              }`}
              title={isCurrent && isPlaying ? "Pause" : "Play"}
            >
              {isCurrent && isPlaying ? (
                <IconPause size={layout === "list" ? 18 : 24} />
              ) : (
                <IconPlay size={layout === "list" ? 18 : 24} />
              )}
            </button>
          </div>
        )}

        {/* Legend badge - only in grid view */}
        {song.isLegend && layout === "grid" && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-xs text-white px-2 py-1 rounded-md shadow-lg font-semibold z-10">
            ⭐ LEGEND
          </div>
        )}

        {/* Duration badge - only in grid view */}
        {layout === "grid" && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md z-10">
            {formatDuration(song.duration)}
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className={`flex-1 min-w-0 ${layout === "grid" ? "p-4" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors ${
                layout === "list" ? "text-base" : "text-sm"
              }`}
              title={song.title}
              onClick={handleOpenSongPage}
            >
              {song.title || "Untitled"}
            </h3>
            <p
              className={`text-gray-500 truncate ${
                layout === "list" ? "text-sm" : "text-xs mt-1"
              }`}
            >
              {song.artist || "Unknown artist"}
            </p>

            {/* Tags - only in grid view */}
            {song.tags && song.tags.length > 0 && layout === "grid" && (
              <div className="mt-3 flex items-center gap-2 overflow-hidden flex-wrap">
                {song.tags.slice(0, 3).map((t, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Duration - only in list view */}
          {layout === "list" && (
            <div className="text-sm text-gray-400 px-4">
              {formatDuration(song.duration)}
            </div>
          )}

          {/* Action Buttons */}
          {showControls && (
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleToggleLike}
                aria-pressed={liked}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={liked ? "Unlike" : "Like"}
                disabled={working}
              >
                <span className={liked ? "text-red-500" : "text-gray-400"}>
                  <IconHeart size={18} />
                </span>
              </button>

              {/* 3-Dot Options Menu */}
              <div className="relative">
                <button
                  type="button"
                  ref={optionsButtonRef}
                  onClick={openOptions}
                  className={`p-2 rounded-full transition-colors text-gray-600 hover:text-gray-900 ${
                    optionsOpen ? "bg-purple-100" : "hover:bg-gray-100"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={optionsOpen}
                  title="More options"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {/* Popup Menu */}
                {optionsOpen &&
                  createPortal(
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 bg-black/40"
                        style={{ zIndex: 9998 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          closeOptions();
                        }}
                        aria-hidden="true"
                      />
                      {/* Menu Container - Always centered in viewport */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="fixed"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 9999,
                        }}
                      >
                        <SongOptionsMenu
                          song={song}
                          onClose={closeOptions}
                          onOpenComments={onOpenComments}
                          onOpenKaraoke={onOpenKaraoke}
                          onAddToCollection={
                            onAddToCollection ||
                            (() => {
                              closeOptions();
                              setShowAddToPlaylist(true);
                            })
                          }
                          onShare={onShare}
                        />
                      </div>
                    </>,
                    document.body
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add to Playlist Modal */}
      {showAddToPlaylist &&
        createPortal(
          <AddToPlaylistModal
            song={song}
            onClose={() => setShowAddToPlaylist(false)}
          />,
          document.body
        )}
    </div>
  );
}

// SongCard.propTypes = {
//   song: PropTypes.shape({
//     songId: PropTypes.string,
//     id: PropTypes.string,
//     title: PropTypes.string,
//     artist: PropTypes.string,
//     coverUrl: PropTypes.string,
//     duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//     tags: PropTypes.array,
//     isLegend: PropTypes.bool,
//     liked: PropTypes.bool,
//   }).isRequired,
//   compact: PropTypes.bool,
//   showControls: PropTypes.bool,
//   onOpenComments: PropTypes.func,
//   onOpenKaraoke: PropTypes.func,
//   onAddToCollection: PropTypes.func,
//   onShare: PropTypes.func,
// };
