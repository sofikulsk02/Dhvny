// src/services/player.service.js
/**
 * Player service - manages queue, current index, shuffle & repeat modes, and state subscriptions.
 *
 * Usage:
 *   import playerService from "../services/player.service";
 *
 *   playerService.init({ persist: true }); // optional
 *   playerService.addToQueue(song); // song object or { songId: '...' }
 *   playerService.addToQueueNext(song);
 *   playerService.playNext(); // returns the next song object or null
 *   playerService.subscribe(state => { ... }); // listen to updates
 *
 * Note:
 *   - If a song is provided as an object with full metadata it's used as-is.
 *   - If a song is provided as { songId: '...' } and you want full metadata,
 *     enable `useRemoteResolver` (default true) and ensure `src/api/songs.api.js` exists.
 */

import songsApi from "../api/songs.api";

const STORAGE_KEY = "dhvny_player";

function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

const defaultState = {
  queue: [], // array of song objects
  currentIndex: -1, // -1 = no song selected
  isPlaying: false,
  shuffle: false,
  repeat: "off", // "off" | "one" | "all"
  updatedAt: Date.now(),
};

/* Simple in-memory pub/sub */
class PlayerService {
  constructor() {
    this.state = { ...defaultState };
    this.listeners = new Set();
    this.persist = true;
    this.useRemoteResolver = true; // if true, will call songsApi.getSong when only id provided
    this.restoreFromStorage();
  }

  init(opts = {}) {
    if (typeof opts.persist === "boolean") this.persist = opts.persist;
    if (typeof opts.useRemoteResolver === "boolean")
      this.useRemoteResolver = opts.useRemoteResolver;
    if (opts.initialState) {
      this.state = {
        ...this.state,
        ...opts.initialState,
        updatedAt: Date.now(),
      };
      this.saveToStorage();
      this.emitChange();
    }
  }

  /* persistence */
  restoreFromStorage() {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) {
        const data = safeParse(raw);
        if (data) {
          this.state = { ...this.state, ...data, updatedAt: Date.now() };
        }
      }
    } catch (e) {
      // ignore
    }
  }

  saveToStorage() {
    if (!this.persist) return;
    try {
      if (typeof window !== "undefined") {
        // Only save essential fields (avoid saving large objects unnecessarily)
        const payload = {
          queue: this.state.queue,
          currentIndex: this.state.currentIndex,
          shuffle: this.state.shuffle,
          repeat: this.state.repeat,
          isPlaying: this.state.isPlaying,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  /* pub/sub */
  subscribe(fn) {
    this.listeners.add(fn);
    // send initial snapshot
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  emitChange() {
    this.state.updatedAt = Date.now();
    this.saveToStorage();
    const snapshot = this.getState();
    for (const l of this.listeners) {
      try {
        l(snapshot);
      } catch (e) {
        // swallow listener errors
        // (listeners should handle their own exceptions)
      }
    }
  }

  getState() {
    // return a shallow copy to avoid direct mutation
    return {
      queue: [...this.state.queue],
      currentIndex: this.state.currentIndex,
      currentSong: this.state.queue[this.state.currentIndex] ?? null,
      isPlaying: this.state.isPlaying,
      shuffle: this.state.shuffle,
      repeat: this.state.repeat,
      updatedAt: this.state.updatedAt,
    };
  }

  /* Helpers */
  async resolveSong(maybeSong) {
    // If it's an object with songId only, try to fetch full data
    if (!maybeSong) return null;
    if (typeof maybeSong === "object" && !maybeSong.songId && maybeSong.title) {
      return maybeSong; // full object already
    }
    if (typeof maybeSong === "string") {
      // assume songId
      maybeSong = { songId: maybeSong };
    }
    if (maybeSong.songId && this.useRemoteResolver) {
      try {
        const res = await songsApi.getSong(maybeSong.songId);
        // backend expected to return song or { song: {...} }
        if (res && res.song) return res.song;
        return res;
      } catch (e) {
        // fallback to minimal object with id
        return {
          songId: maybeSong.songId,
          title: maybeSong.title || "Unknown",
          artist: maybeSong.artist || "",
        };
      }
    }
    return maybeSong;
  }

  /* queue operations */
  async addToQueue(songOrId) {
    const song = await this.resolveSong(songOrId);
    this.state.queue.push(song);
    // if nothing selected, select first added
    if (this.state.currentIndex === -1) {
      this.state.currentIndex = 0;
    }
    this.emitChange();
    return song;
  }

  async addToQueueNext(songOrId) {
    const song = await this.resolveSong(songOrId);
    const idx =
      this.state.currentIndex >= 0
        ? this.state.currentIndex + 1
        : this.state.queue.length;
    this.state.queue.splice(idx, 0, song);
    // if nothing selected, select first
    if (this.state.currentIndex === -1) this.state.currentIndex = 0;
    this.emitChange();
    return song;
  }

  async addMultiple(songsArray = []) {
    const resolved = [];
    for (const s of songsArray) {
      // sequential resolution to avoid flooding backend
      const r = await this.resolveSong(s);
      resolved.push(r);
      this.state.queue.push(r);
    }
    if (this.state.currentIndex === -1 && this.state.queue.length > 0)
      this.state.currentIndex = 0;
    this.emitChange();
    return resolved;
  }

  removeFromQueueByIndex(index) {
    if (index < 0 || index >= this.state.queue.length) return null;
    const removed = this.state.queue.splice(index, 1)[0];
    if (index < this.state.currentIndex) {
      this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
    } else if (index === this.state.currentIndex) {
      // if removing current, try to keep playing next item at same index
      if (this.state.queue.length === 0) {
        this.state.currentIndex = -1;
        this.state.isPlaying = false;
      } else if (this.state.currentIndex >= this.state.queue.length) {
        this.state.currentIndex = this.state.queue.length - 1;
      }
    }
    this.emitChange();
    return removed;
  }

  removeFromQueueBySongId(songId) {
    const idx = this.state.queue.findIndex(
      (s) => s && (s.songId === songId || s.id === songId)
    );
    if (idx === -1) return null;
    return this.removeFromQueueByIndex(idx);
  }

  moveInQueue(fromIndex, toIndex) {
    if (
      fromIndex < 0 ||
      fromIndex >= this.state.queue.length ||
      toIndex < 0 ||
      toIndex >= this.state.queue.length
    ) {
      return false;
    }
    const [item] = this.state.queue.splice(fromIndex, 1);
    this.state.queue.splice(toIndex, 0, item);
    // adjust currentIndex if needed
    if (this.state.currentIndex === fromIndex) {
      this.state.currentIndex = toIndex;
    } else if (
      fromIndex < this.state.currentIndex &&
      toIndex >= this.state.currentIndex
    ) {
      this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
    } else if (
      fromIndex > this.state.currentIndex &&
      toIndex <= this.state.currentIndex
    ) {
      this.state.currentIndex = Math.min(
        this.state.queue.length - 1,
        this.state.currentIndex + 1
      );
    }
    this.emitChange();
    return true;
  }

  clearQueue() {
    this.state.queue = [];
    this.state.currentIndex = -1;
    this.state.isPlaying = false;
    this.emitChange();
  }

  setQueue(queue = [], startIndex = 0) {
    this.state.queue = queue;
    this.state.currentIndex =
      queue && queue.length > 0
        ? Math.min(Math.max(0, startIndex), queue.length - 1)
        : -1;
    this.emitChange();
  }

  /* playback controls */
  setPlaying(flag) {
    this.state.isPlaying = !!flag;
    this.emitChange();
  }

  togglePlaying() {
    this.state.isPlaying = !this.state.isPlaying;
    this.emitChange();
    return this.state.isPlaying;
  }

  setCurrentIndex(index) {
    if (index < 0 || index >= this.state.queue.length) {
      this.state.currentIndex = -1;
      this.emitChange();
      return null;
    }
    this.state.currentIndex = index;
    this.emitChange();
    return this.state.queue[this.state.currentIndex];
  }

  setCurrentBySongId(songId) {
    const idx = this.state.queue.findIndex(
      (s) => s && (s.songId === songId || s.id === songId)
    );
    if (idx === -1) return null;
    return this.setCurrentIndex(idx);
  }

  getCurrentSong() {
    return this.state.queue[this.state.currentIndex] ?? null;
  }

  /* repeat/shuffle */
  setShuffle(enabled) {
    this.state.shuffle = !!enabled;
    this.emitChange();
  }

  toggleShuffle() {
    this.state.shuffle = !this.state.shuffle;
    this.emitChange();
    return this.state.shuffle;
  }

  setRepeat(mode = "off") {
    if (!["off", "one", "all"].includes(mode))
      throw new Error("repeat must be 'off'|'one'|'all'");
    this.state.repeat = mode;
    this.emitChange();
  }

  /* navigation logic */
  async playNext() {
    if (!this.state.queue.length) {
      this.state.isPlaying = false;
      this.emitChange();
      return null;
    }

    // if repeat one -> same song
    if (this.state.repeat === "one") {
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    if (this.state.shuffle) {
      // pick random index other than current if possible
      if (this.state.queue.length === 1) {
        this.state.currentIndex = 0;
      } else {
        let next;
        do {
          next = Math.floor(Math.random() * this.state.queue.length);
        } while (next === this.state.currentIndex);
        this.state.currentIndex = next;
      }
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    // normal sequential
    const nextIndex = this.state.currentIndex + 1;
    if (nextIndex < this.state.queue.length) {
      this.state.currentIndex = nextIndex;
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    // reached end
    if (this.state.repeat === "all") {
      this.state.currentIndex = 0;
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    // no more songs
    this.state.isPlaying = false;
    this.emitChange();
    return null;
  }

  async playPrevious() {
    if (!this.state.queue.length) {
      this.state.isPlaying = false;
      this.emitChange();
      return null;
    }

    // if repeat one -> same
    if (this.state.repeat === "one") {
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    if (this.state.shuffle) {
      // random pick
      if (this.state.queue.length === 1) {
        this.state.currentIndex = 0;
      } else {
        let prev;
        do {
          prev = Math.floor(Math.random() * this.state.queue.length);
        } while (prev === this.state.currentIndex);
        this.state.currentIndex = prev;
      }
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    const prevIndex = this.state.currentIndex - 1;
    if (prevIndex >= 0) {
      this.state.currentIndex = prevIndex;
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    if (this.state.repeat === "all") {
      this.state.currentIndex = this.state.queue.length - 1;
      this.state.isPlaying = true;
      this.emitChange();
      return this.getCurrentSong();
    }

    // at start, no previous
    this.state.isPlaying = false;
    this.emitChange();
    return null;
  }

  /** Seek and/or update progress metadata only; actual audio element should be controlled by player UI */
  updateProgress(seconds) {
    const s = this.state.queue[this.state.currentIndex];
    if (!s) return;
    s.progress = seconds;
    this.emitChange();
  }

  /** Shuffle queue items but keep current song in place */
  shuffleQueue() {
    if (!this.state.queue || this.state.queue.length <= 1) return;
    const current = this.getCurrentSong();
    const items = this.state.queue.slice();
    // Fisher-Yates
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    // ensure current remains the same item (find index of the same songId)
    const curId = current && (current.songId || current.id);
    const newIndex = items.findIndex(
      (it) => it && (it.songId === curId || it.id === curId)
    );
    if (newIndex !== -1) {
      // swap newIndex to be at front of currentIndex position
      const targetIndex = Math.min(
        this.state.currentIndex >= 0 ? this.state.currentIndex : 0,
        items.length - 1
      );
      const [item] = items.splice(newIndex, 1);
      items.splice(targetIndex, 0, item);
      this.state.queue = items;
      this.state.currentIndex = targetIndex;
    } else {
      // fallback
      this.state.queue = items;
      this.state.currentIndex = 0;
    }
    this.emitChange();
  }

  /* utility getters */
  getQueue() {
    return this.state.queue.slice();
  }

  getQueueLength() {
    return this.state.queue.length;
  }
}

/* Export a singleton instance */
const playerService = new PlayerService();

export default playerService;
