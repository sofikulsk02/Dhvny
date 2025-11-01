// src/contexts/PlayerContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import playerService from "../services/player.services";

/**
 * PlayerContext
 *
 * Exposes a broad API used by app components:
 * - state: queue[], currentIndex, currentSong, isPlaying, position, duration, volume
 * - methods: addToQueue, addToQueueNext, setQueue, setCurrentIndex, setCurrentBySongId, removeFromQueueByIndex,
 *   moveInQueue, clearQueue, setPlaying, togglePlaying, playNext, playPrevious, seek, setVolume
 *
 * Also sets playerService methods so components importing playerService.* can call them.
 */

export const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueueState] = useState([]); // array of song objects
  const [currentIndex, setCurrentIndexState] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds
  const [volume, setVolumeState] = useState(1);

  const audioRef = useRef(null);
  const positionTimerRef = useRef(null);
  const playNextRef = useRef(null); // Store reference to playNext function

  // initialize audio element
  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    a.crossOrigin = "anonymous";
    audioRef.current = a;

    const onTime = () => {
      setPosition(a.currentTime || 0);
    };
    const onLoaded = () => {
      setDuration(a.duration || 0);
    };
    const onEnded = () => {
      // default behavior: play next if exists, else stop
      if (playNextRef.current) {
        playNextRef.current();
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);

    // cleanup
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  const getQueueLength = useCallback(() => queue.length, [queue]);

  const getCurrentSong = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < queue.length)
      return queue[currentIndex];
    return null;
  }, [queue, currentIndex]);

  // load current song into audio element (but don't auto-play unless isPlaying true)
  const loadCurrentIntoAudio = useCallback(
    async (index = currentIndex, shouldPlay = false) => {
      const song = queue[index];
      if (!audioRef.current) return;
      if (!song || !song.audioUrl) {
        audioRef.current.pause();
        audioRef.current.src = "";
        setDuration(0);
        setPosition(0);
        return;
      }
      try {
        console.log("🎵 Loading song:", song.title, "URL:", song.audioUrl);
        audioRef.current.src = song.audioUrl;
        // ensure metadata loads
        await audioRef.current.load?.();
        // ensure volume
        audioRef.current.volume = volume;
        console.log(
          "✅ Song loaded successfully, duration:",
          audioRef.current.duration
        );
        if (shouldPlay) {
          try {
            await audioRef.current.play();
            console.log("▶️ Playing song:", song.title);
          } catch (err) {
            // Autoplay might be blocked; set isPlaying state but don't throw
            console.warn("⚠️ Audio play prevented (autoplay block?):", err);
          }
        }
      } catch (err) {
        console.error("❌ loadCurrentIntoAudio error:", err);
      }
    },
    [queue, currentIndex, volume]
  );

  // queue operations
  const setQueue = useCallback(
    (newQueue = [], startIndex = 0, play = false) => {
      setQueueState(newQueue.slice());
      const idx = typeof startIndex === "number" ? startIndex : 0;
      const normalized = Math.min(
        Math.max(idx, 0),
        Math.max(0, newQueue.length - 1)
      );
      setCurrentIndexState(normalized);
      if (play) {
        setIsPlaying(true); // Update state immediately when play is requested
      }
      setTimeout(() => loadCurrentIntoAudio(normalized, !!play), 0);
    },
    [loadCurrentIntoAudio]
  );

  const addToQueue = useCallback((song) => {
    setQueueState((q) => {
      const copy = q.slice();
      copy.push(song);
      return copy;
    });
  }, []);

  const addToQueueNext = useCallback(
    (song) => {
      setQueueState((q) => {
        const copy = q.slice();
        const insertAt = Math.max(0, currentIndex + 1);
        copy.splice(insertAt, 0, song);
        return copy;
      });
    },
    [currentIndex]
  );

  const removeFromQueueByIndex = useCallback(
    (idx) => {
      setQueueState((q) => {
        if (idx < 0 || idx >= q.length) return q;
        const copy = q.slice();
        copy.splice(idx, 1);
        // adjust currentIndex
        if (idx < currentIndex) {
          setCurrentIndexState((ci) => Math.max(0, ci - 1));
        } else if (idx === currentIndex) {
          // stop current and load next
          setCurrentIndexState((ci) => Math.min(ci, copy.length - 1));
        }
        return copy;
      });
    },
    [currentIndex]
  );

  const removeFromQueueBySongId = useCallback(
    (songId) => {
      setQueueState((q) => {
        const idx = q.findIndex((s) => (s.songId || s.id) === songId);
        if (idx === -1) return q;
        const copy = q.slice();
        copy.splice(idx, 1);
        if (idx < currentIndex) {
          setCurrentIndexState((ci) => Math.max(0, ci - 1));
        } else if (idx === currentIndex) {
          setCurrentIndexState((ci) => Math.min(ci, copy.length - 1));
        }
        return copy;
      });
    },
    [currentIndex]
  );

  const moveInQueue = useCallback(
    (fromIdx, toIdx) => {
      setQueueState((q) => {
        if (
          !q ||
          fromIdx < 0 ||
          fromIdx >= q.length ||
          toIdx < 0 ||
          toIdx >= q.length
        )
          return q;
        const copy = q.slice();
        const [item] = copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, item);
        // update currentIndex if moved item affects it
        if (fromIdx === currentIndex) {
          setCurrentIndexState(toIdx);
        } else if (fromIdx < currentIndex && toIdx >= currentIndex) {
          setCurrentIndexState((ci) => Math.max(0, ci - 1));
        } else if (fromIdx > currentIndex && toIdx <= currentIndex) {
          setCurrentIndexState((ci) => ci + 1);
        }
        return copy;
      });
    },
    [currentIndex]
  );

  const clearQueue = useCallback(() => {
    setQueueState([]);
    setCurrentIndexState(-1);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setPosition(0);
      setDuration(0);
    }
    setIsPlaying(false);
  }, []);

  const setCurrentIndex = useCallback(
    (idx) => {
      if (typeof idx !== "number") return;
      const normalized = Math.max(-1, Math.min(idx, queue.length - 1));
      setCurrentIndexState(normalized);
      setTimeout(() => loadCurrentIntoAudio(normalized, isPlaying), 0);
    },
    [queue.length, loadCurrentIntoAudio, isPlaying]
  );

  const setCurrentBySongId = useCallback(
    (songId, shouldPlay = false) => {
      console.log(
        "🎯 setCurrentBySongId called:",
        songId,
        "shouldPlay:",
        shouldPlay
      );
      const idx = queue.findIndex(
        (s) => (s._id || s.songId || s.id) === songId
      );
      if (idx !== -1) {
        console.log("✅ Found song at index:", idx, "- setting as current");
        setCurrentIndexState(idx);
        // Load and play immediately if requested
        setTimeout(() => {
          loadCurrentIntoAudio(idx, shouldPlay);
          if (shouldPlay) {
            setIsPlaying(true);
          }
        }, 0);
      } else {
        console.warn("songId not in queue:", songId);
        console.log(
          "Queue songs:",
          queue.map((s) => ({ id: s._id || s.songId || s.id, title: s.title }))
        );
      }
    },
    [queue, loadCurrentIntoAudio]
  );

  // playback operations
  const setPlaying = useCallback(
    (play) => {
      const song = getCurrentSong();
      console.log("🎵 setPlaying called:", play, "currentSong:", song?.title);
      setIsPlaying(!!play);
      if (!audioRef.current) return;
      if (play) {
        audioRef.current.play().catch((e) => console.warn("play prevented", e));
      } else {
        audioRef.current.pause();
      }
    },
    [getCurrentSong]
  );

  const togglePlaying = useCallback(() => {
    console.log(
      "🔄 togglePlaying called - current state:",
      isPlaying,
      "→",
      !isPlaying
    );
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const next = currentIndex + 1;
    if (next < queue.length) {
      setCurrentIndex(next);
      setTimeout(() => setPlaying(true), 50);
    } else {
      // reached end: stop
      setPlaying(false);
    }
  }, [currentIndex, queue.length, setCurrentIndex, setPlaying]);

  // Update the ref whenever playNext changes
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    const prev = Math.max(0, currentIndex - 1);
    setCurrentIndex(prev);
    setTimeout(() => setPlaying(true), 50);
  }, [currentIndex, queue.length, setCurrentIndex, setPlaying]);

  const seek = useCallback((seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(seconds) || 0;
    setPosition(audioRef.current.currentTime || 0);
  }, []);

  const setVolume = useCallback((v) => {
    const vol = Math.min(1, Math.max(0, Number(v) || 0));
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  // sync audio element when currentIndex changes
  useEffect(() => {
    // if currentIndex changed, load that song
    if (currentIndex === -1) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setPosition(0);
      setDuration(0);
      return;
    }
    loadCurrentIntoAudio(currentIndex, isPlaying);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // sync isPlaying -> audio
  useEffect(() => {
    if (!audioRef.current) return;
    const song = getCurrentSong();
    console.log(
      "🎮 Player state changed - isPlaying:",
      isPlaying,
      "currentSong:",
      song?.title
    );
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("⚠️ Play failed:", err);
      });
    } else {
      audioRef.current.pause();
      console.log("⏸️ Audio paused");
    }
  }, [isPlaying, getCurrentSong]);

  // when queue changes ensure currentIndex valid
  useEffect(() => {
    if (queue.length === 0) {
      setCurrentIndexState(-1);
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);
    } else if (currentIndex >= queue.length) {
      setCurrentIndexState(Math.max(0, queue.length - 1));
    }
  }, [queue, currentIndex]);

  // publish methods to playerService singleton so other non-hook files can call them
  useEffect(() => {
    playerService.setQueue = setQueue;
    playerService.addToQueue = addToQueue;
    playerService.addToQueueNext = addToQueueNext;
    playerService.removeFromQueueByIndex = removeFromQueueByIndex;
    playerService.removeFromQueueBySongId = removeFromQueueBySongId;
    playerService.moveInQueue = moveInQueue;
    playerService.clearQueue = clearQueue;
    playerService.setCurrentIndex = setCurrentIndex;
    playerService.setCurrentBySongId = setCurrentBySongId;

    playerService.setPlaying = setPlaying;
    playerService.togglePlaying = togglePlaying;
    playerService.playNext = playNext;
    playerService.playPrevious = playPrevious;
    playerService.seek = seek;
    playerService.setVolume = setVolume;

    playerService.getQueue = () => queue.slice();
    playerService.getState = () => ({
      queue: queue.slice(),
      currentIndex,
      currentSong: getCurrentSong(),
      isPlaying,
      position,
      duration,
      volume,
    });

    playerService.getQueueLength = getQueueLength;
  }, [
    setQueue,
    addToQueue,
    addToQueueNext,
    removeFromQueueByIndex,
    removeFromQueueBySongId,
    moveInQueue,
    clearQueue,
    setCurrentIndex,
    setCurrentBySongId,
    setPlaying,
    togglePlaying,
    playNext,
    playPrevious,
    seek,
    setVolume,
    queue,
    currentIndex,
    isPlaying,
    position,
    duration,
    volume,
    getCurrentSong,
    getQueueLength,
  ]);

  const currentSong = getCurrentSong();

  const value = {
    queue,
    currentIndex,
    currentSong,
    isPlaying,
    position,
    duration,
    volume,

    // queue ops
    setQueue,
    addToQueue,
    addToQueueNext,
    removeFromQueueByIndex,
    removeFromQueueBySongId,
    moveInQueue,
    clearQueue,
    setCurrentIndex,
    setCurrentBySongId,
    getQueueLength,

    // playback
    setPlaying,
    togglePlaying,
    playNext,
    playPrevious,
    seek,
    setVolume,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  return useContext(PlayerContext);
}

// convenience default export: usePlayer hook
export default function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return ctx;
}

// also provide a named export for callers that use `import { usePlayer } from ...`
export { usePlayer };
