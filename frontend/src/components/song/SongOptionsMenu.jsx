// src/components/song/SongOptionsMenu.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import playerService from "../../services/player.services";
import songsApi from "../../api/songs.api";
import { useAuth } from "../../hooks/useAuth";

/**
 * SongOptionsMenu
 *
 * Props:
 *  - song (required): song object { songId/id, title, artist, ... }
 *  - onClose(): optional callback to close menu/popover
 *  - onOpenComments(song): optional callback to open comments overlay
 *  - onOpenKaraoke(song): optional callback to open karaoke/recorder
 *  - onAddToCollection(song): optional callback / fallback to default UI
 *
 * Behavior:
 *  - Play Next => inserts the song right after current via playerService.addToQueueNext
 *  - Add to Queue => appends to queue
 *  - Play Now => sets queue to song and plays immediately
 *  - Add to Collection => calls onAddToCollection or shows a small message (placeholder)
 *  - Share by name => copies "Song Title — Dhvny" and shows note to send by name; also calls onShare prop if provided
 *  - Promote to Legend => tries songsApi.setLegend(songId, true), fallback to localStorage promotion counter (threshold=3)
 *  - Like/Unlike => calls songsApi.likeSong(songId, like)
 *  - Open Song Page => navigates to `/songs/:id`
 *
 * NOTE: This component is UI-first. Replace songsApi endpoints as needed.
 */

function SmallButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium rounded-lg hover:bg-purple-50 active:bg-purple-100 transition-colors focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}

// SmallButton.propTypes = {
//   children: PropTypes.node,
//   onClick: PropTypes.func,
//   className: PropTypes.string,
// };

const LOCAL_LEGEND_KEY = "dhvny_legend_promotions_v1";
const LEGEND_THRESHOLD = 3; // as per your request

export default function SongOptionsMenu({
  song,
  onClose = () => {},
  onOpenComments = null,
  onOpenKaraoke = null,
  onAddToCollection = null,
  onShare = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth(); // may throw if no AuthProvider, but that's fine during dev
  const userId = user?.userId ?? user?.username ?? "anonymous";

  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [legendState, setLegendState] = useState({
    isLegend: !!song?.isLegend,
    count: 0,
    promotedByMe: false,
  });
  const [notice, setNotice] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // helper: read/write local legend storage (fallback when backend not available)
  const readLocalPromotions = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_LEGEND_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }, []);

  const writeLocalPromotions = useCallback((obj) => {
    try {
      localStorage.setItem(LOCAL_LEGEND_KEY, JSON.stringify(obj));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // init legend state from song metadata and local fallback
    let local = readLocalPromotions();
    const rec = local[song.songId || song.id] || { by: [] };
    setLegendState({
      isLegend: !!song?.isLegend || rec.by.length >= LEGEND_THRESHOLD,
      count: rec.by.length,
      promotedByMe: rec.by.includes(userId),
    });
    // init liked from song flags if present
    setLiked(Boolean(song?.liked));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.songId, song?.id, song?.isLegend, song?.liked]);

  // Check if user is admin (global playlist owner)
  useEffect(() => {
    async function loadGlobalPlaylist() {
      try {
        const playlistsApi = await import("../../api/playlists.api");
        const data = await playlistsApi.getGlobalPlaylist();
        console.log("🔍 Global playlist owner check:", {
          globalPlaylistOwner: data?.owner,
          currentUser: user,
          userId: user?._id,
          userUserId: user?.userId,
        });

        // Check if current user is the owner
        if (data && user && data.owner) {
          const ownerId =
            typeof data.owner === "object" ? data.owner._id : data.owner;
          const currentUserId = user._id || user.userId || user.id;
          const isOwner = currentUserId === ownerId;
          console.log("👤 Admin check result:", {
            ownerId,
            currentUserId,
            isOwner,
          });
          setIsAdmin(isOwner);
        }
      } catch (err) {
        console.log("No global playlist found or error loading it", err);
        setIsAdmin(false);
      }
    }
    if (user) {
      loadGlobalPlaylist();
    }
  }, [user]);

  // small ephemeral toast function
  const toast = useCallback((text, ms = 2000) => {
    setNotice(text);
    setTimeout(() => setNotice(null), ms);
  }, []);

  // 1) Play Next
  const handlePlayNext = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setLoading(true);
      try {
        await playerService.addToQueueNext(song);
        toast("Added to play next");
      } catch (err) {
        console.error("playNext error", err);
        toast("Could not add to queue");
      } finally {
        setLoading(false);
        onClose();
      }
    },
    [song, onClose, toast]
  );

  // 2) Add to Queue (append)
  const handleAddToQueue = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setLoading(true);
      try {
        await playerService.addToQueue(song);
        toast("Added to queue");
      } catch (err) {
        console.error("addToQueue error", err);
        toast("Could not add to queue");
      } finally {
        setLoading(false);
        onClose();
      }
    },
    [song, onClose, toast]
  );

  // 3) Play Now
  const handlePlayNow = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setLoading(true);
      try {
        // set queue to only this song and play
        playerService.setQueue([song], 0);
        playerService.setPlaying(true);
        toast("Playing now");
      } catch (err) {
        console.error("playNow error", err);
        toast("Could not play");
      } finally {
        setLoading(false);
        onClose();
      }
    },
    [song, onClose, toast]
  );

  // 4) Add to Collection (delegate to parent if provided)
  const handleAddToCollection = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (typeof onAddToCollection === "function") {
        onAddToCollection(song);
        onClose();
        return;
      }
      // fallback placeholder
      toast("Open Collections → Click + to add this song");
      onClose();
    },
    [onAddToCollection, song, onClose, toast]
  );

  // 4b) Add to Global Playlist (admin only)
  const handleAddToGlobalPlaylist = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setLoading(true);
      try {
        const playlistsApi = await import("../../api/playlists.api");
        await playlistsApi.addSongToGlobalPlaylist(song.songId || song.id);
        toast("Added to Global Playlist");
      } catch (err) {
        console.error("Add to global playlist error", err);
        if (err.response?.status === 404) {
          toast("Global playlist not found. Please create it first.");
        } else if (err.response?.status === 403) {
          toast("Only admins can add songs to the global playlist");
        } else {
          toast("Could not add to global playlist");
        }
      } finally {
        setLoading(false);
        onClose();
      }
    },
    [song, onClose, toast]
  );

  // 5) Share by name (copies text to clipboard)
  const handleShare = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      const payload = `${song.title} — ${song.artist || "Unknown"} (${
        song.songId || song.id
      })`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(payload);
          toast("Song name copied. Send it to a friend by name.");
        } else {
          // fallback: create temporary input
          const tmp = document.createElement("textarea");
          tmp.value = payload;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand("copy");
          document.body.removeChild(tmp);
          toast("Song name copied.");
        }
        if (typeof onShare === "function") onShare(song);
      } catch (err) {
        console.error("share error", err);
        toast("Could not copy song name");
      } finally {
        onClose();
      }
    },
    [song, onClose, toast, onShare]
  );

  // 6) Like / Unlike
  const handleToggleLike = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      const previousLiked = liked;
      try {
        // Optimistically update UI
        setLiked((prev) => !prev);

        // Call toggle API (no parameters needed, it's a toggle)
        const response = await songsApi.likeSong(song.songId || song.id);

        // Update with server response if available
        if (response && typeof response.liked === "boolean") {
          setLiked(response.liked);
        }

        toast(response?.liked ? "Liked ❤️" : "Unliked");
      } catch (err) {
        console.error("likeSong error", err);
        // rollback on error
        setLiked(previousLiked);
        toast("Could not update like");
      } finally {
        onClose();
      }
    },
    [song, liked, onClose, toast]
  );

  // 7) Promote to Legend (tries backend; falls back to local client-side simulation)
  const handlePromoteLegend = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setLoading(true);
      try {
        // Try the server call first (if backend available)
        try {
          const res = await songsApi.setLegend(song.songId || song.id, true);
          // backend should return updated song or status
          if (res && (res.song || res.isLegend || res.count)) {
            // rely on server response
            const isLeg = Boolean(res.isLegend || res.song?.isLegend);
            const count = res.count ?? res.song?.legendCount ?? 0;
            setLegendState({
              isLegend: isLeg,
              count: count || LEGEND_THRESHOLD,
              promotedByMe: true,
            });
            toast(
              isLeg ? "Promoted to Legend" : `Promotion recorded (${count})`
            );
            onClose();
            return;
          }
        } catch (serverErr) {
          // server not available or route not implemented — fallback to local
          console.warn(
            "setLegend server failed, falling back to local:",
            serverErr
          );
        }

        // Local fallback: store in localStorage as simple set of userIds per song
        const all = readLocalPromotions();
        const id = song.songId || song.id;
        const rec = all[id] || { by: [] };
        if (!rec.by.includes(userId)) rec.by.push(userId);
        rec.by = Array.from(new Set(rec.by));
        all[id] = rec;
        writeLocalPromotions(all);

        const count = rec.by.length;
        const becameLegend = count >= LEGEND_THRESHOLD;
        setLegendState({
          isLegend: becameLegend,
          count,
          promotedByMe: rec.by.includes(userId),
        });
        toast(
          becameLegend
            ? "Song became Legend (local)"
            : `Promotion recorded (${count}/${LEGEND_THRESHOLD})`
        );
      } catch (err) {
        console.error("promoteLegend error", err);
        toast("Could not promote");
      } finally {
        setLoading(false);
        onClose();
      }
    },
    [song, onClose, readLocalPromotions, writeLocalPromotions, userId, toast]
  );

  // 8) Demote (remove promotion by this user) — optional
  const handleDemoteLegend = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      setLoading(true);
      try {
        // attempt server call
        try {
          await songsApi.setLegend(song.songId || song.id, false);
          setLegendState({ isLegend: false, count: 0, promotedByMe: false });
          toast("Demoted from Legend (server)");
          onClose();
          return;
        } catch (serverErr) {
          // fallback
          console.warn("server demote failed", serverErr);
        }

        const all = readLocalPromotions();
        const id = song.songId || song.id;
        const rec = all[id] || { by: [] };
        rec.by = (rec.by || []).filter((u) => u !== userId);
        all[id] = rec;
        writeLocalPromotions(all);
        const count = rec.by.length;
        setLegendState({
          isLegend: count >= LEGEND_THRESHOLD,
          count,
          promotedByMe: rec.by.includes(userId),
        });
        toast("Demoted (local)");
      } catch (err) {
        console.error("demote error", err);
        toast("Could not demote");
      } finally {
        setLoading(false);
        onClose();
      }
    },
    [song, onClose, readLocalPromotions, writeLocalPromotions, userId, toast]
  );

  // 9) Open comments overlay
  const handleOpenComments = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (typeof onOpenComments === "function") {
        onOpenComments(song);
      } else {
        // default: navigate to song page
        navigate(`/songs/${encodeURIComponent(song.songId || song.id)}`, {
          state: { openComments: true },
        });
      }
      onClose();
    },
    [onOpenComments, song, navigate, onClose]
  );

  // 10) Open karaoke/sing-along
  const handleOpenKaraoke = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (typeof onOpenKaraoke === "function") {
        onOpenKaraoke(song);
      } else {
        navigate(
          `/songs/${encodeURIComponent(song.songId || song.id)}?karaoke=1`
        );
      }
      onClose();
    },
    [onOpenKaraoke, song, navigate, onClose]
  );

  // 11) Open song page
  const handleOpenSongPage = useCallback(
    (e) => {
      e?.stopPropagation?.();
      navigate(`/songs/${encodeURIComponent(song.songId || song.id)}`);
      onClose();
    },
    [song, navigate, onClose]
  );

  // memoized menu items (keeps render tidy)
  const menuItems = useMemo(() => {
    const items = [
      { id: "play_now", label: "Play now", action: handlePlayNow },
      { id: "play_next", label: "Play next", action: handlePlayNext },
      { id: "add_queue", label: "Add to queue", action: handleAddToQueue },
      {
        id: "add_collection",
        label: "Add to collection",
        action: handleAddToCollection,
      },
    ];

    // Add global playlist option only for admins
    if (isAdmin) {
      items.push({
        id: "add_to_global",
        label: "Add to Global Playlist",
        action: handleAddToGlobalPlaylist,
      });
    }

    // Continue with other items
    items.push(
      { id: "share", label: "Share (copy name)", action: handleShare },
      {
        id: "like",
        label: liked ? "Unlike" : "Like",
        action: handleToggleLike,
      },
      {
        id: "legend",
        label: legendState.isLegend
          ? "Demote from Legend"
          : `Promote to Legend (${legendState.count}/${LEGEND_THRESHOLD})`,
        action: legendState.isLegend ? handleDemoteLegend : handlePromoteLegend,
      },
      { id: "comments", label: "Comments", action: handleOpenComments },
      {
        id: "karaoke",
        label: "Sing-along / Record",
        action: handleOpenKaraoke,
      },
      { id: "open", label: "Open song page", action: handleOpenSongPage }
    );

    return items;
  }, [
    handlePlayNow,
    handlePlayNext,
    handleAddToQueue,
    handleAddToCollection,
    isAdmin,
    handleAddToGlobalPlaylist,
    handleShare,
    handleToggleLike,
    legendState,
    handlePromoteLegend,
    handleDemoteLegend,
    handleOpenComments,
    handleOpenKaraoke,
    handleOpenSongPage,
    liked,
  ]);

  return (
    <div className="w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-10 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-gray-400 shadow-md">
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt={`${song.title} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">♪</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate text-gray-900">
              {song.title}
            </div>
            <div className="text-sm text-gray-600 truncate">{song.artist}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      </div>

      <div className="py-2">
        {menuItems.map((m) => (
          <div key={m.id} className="px-2">
            <SmallButton onClick={m.action} className="w-full text-left">
              {m.label}
            </SmallButton>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 bg-gray-50">
        {notice && <div className="text-sm text-indigo-600 mb-2">{notice}</div>}
        {loading && <div className="text-sm">Working…</div>}
        <div className="mt-1">
          <div className="text-xs font-medium">
            Legend:{" "}
            {legendState.isLegend
              ? "Yes ⭐"
              : `${legendState.count}/${LEGEND_THRESHOLD}`}
          </div>
        </div>
      </div>
    </div>
  );
}

// SongOptionsMenu.propTypes = {
//   song: PropTypes.object.isRequired,
//   onClose: PropTypes.func,
//   onOpenComments: PropTypes.func,
//   onOpenKaraoke: PropTypes.func,
//   onAddToCollection: PropTypes.func,
//   onShare: PropTypes.func,
// };
