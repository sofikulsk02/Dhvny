// src/api/songs.api.js
/**
 * songs.api.js
 *
 * Frontend API helpers for song-related endpoints.
 * Uses src/api/client.js (imported as `api`) for network calls, token handling & 401 handling.
 *
 * Expected backend endpoints (examples):
 *  GET    /songs             -> { items: [...], total, page, perPage }
 *  GET    /songs/:id         -> { song: {...} }
 *  POST   /songs             -> Accepts FormData (audio + metadata) or JSON metadata
 *  POST   /songs/ingest      -> { sourceUrl: 'https://youtu.be/..' } -> triggers ingestion job
 *  PUT    /songs/:id         -> update metadata
 *  DELETE /songs/:id
 *  POST   /songs/:id/legend  -> promote (or toggle) legend (body: { promote: true/false })
 *  GET    /songs/search?q=.. -> search endpoint
 *
 * NOTE: adapt endpoints to your backend route naming if different.
 */

import api from "./client";

const BASE = "/songs";

/** List songs with pagination & optional filters
 * @param {{ page?: number, perPage?: number, tag?: string, q?: string, includeAll?: boolean }} opts
 * @returns {Promise<{ items: object[], total: number, page: number, perPage: number }>}
 */
export async function listSongs(opts = {}) {
  const { page = 1, perPage = 20, tag, q, sort, includeAll } = opts;
  const query = { page, limit: perPage }; // Backend expects 'limit' not 'perPage'
  if (tag) query.tag = tag;
  if (q) query.search = q; // Backend expects 'search' parameter
  if (sort) query.sort = sort;
  if (includeAll) query.includeAll = "true";
  return api.get(BASE, { query });
}

/** Search songs (alias to listSongs with q) */
export async function searchSongs(q, opts = {}) {
  return listSongs({ ...opts, q });
}

/** Get single song by id
 * @param {string} songId
 */
export async function getSong(songId) {
  if (!songId) throw new Error("songId is required");
  return api.get(`${BASE}/${encodeURIComponent(songId)}`);
}

/** Create a song by uploading file + metadata
 * @param {File|Blob|null} audioFile  - audio file (optional if using sourceUrl)
 * @param {{ title: string, artist?: string, tags?: string[], duration?: number, coverFile?: File|null, sourceUrl?: string }} metadata
 * If audioFile is provided, sends FormData; otherwise will attempt JSON POST (for sourceUrl ingestion).
 */
export async function createSong(audioFile = null, metadata = {}) {
  // If FormData (upload actual audio)
  if (audioFile || metadata.coverFile) {
    const fd = new FormData();
    if (audioFile) fd.append("audio", audioFile);
    if (metadata.coverFile) fd.append("cover", metadata.coverFile);
    if (metadata.title) fd.append("title", metadata.title);
    if (metadata.artist) fd.append("artist", metadata.artist || "");
    if (metadata.tags) fd.append("tags", JSON.stringify(metadata.tags));
    if (metadata.duration) fd.append("duration", String(metadata.duration));
    if (metadata.sourceUrl) fd.append("sourceUrl", metadata.sourceUrl);
    // additional fields - e.g. isPublic, uploadedBy etc
    if (typeof metadata.isPublic !== "undefined")
      fd.append("isPublic", metadata.isPublic ? "1" : "0");

    return api.post(`${BASE}`, fd, { isJson: false });
  }

  // Otherwise send JSON (e.g., create record pointing to external source URL)
  return api.post(`${BASE}`, metadata, { isJson: true });
}

/** Ingest a song from external URL (e.g., YouTube) — backend handles conversion & job queue
 * @param {string} sourceUrl
 * @param {{ title?: string, artist?: string, tags?: string[] }} opts
 */
export async function ingestFromSource(sourceUrl, opts = {}) {
  if (!sourceUrl) throw new Error("sourceUrl is required");
  const body = { sourceUrl, ...opts };
  // This endpoint should start an ingestion job and return job id / song stub
  return api.post(`${BASE}/ingest`, body);
}

/** Update song metadata
 * @param {string} songId
 * @param {Object} updates
 */
export async function updateSong(songId, updates = {}) {
  if (!songId) throw new Error("songId is required");
  return api.put(`${BASE}/${encodeURIComponent(songId)}`, updates);
}

/** Delete a song
 * @param {string} songId
 */
export async function deleteSong(songId) {
  if (!songId) throw new Error("songId is required");
  return api.del(`${BASE}/${encodeURIComponent(songId)}`);
}

/** Promote a song to Legend
 * @param {string} songId
 */
export async function setLegend(songId) {
  if (!songId) throw new Error("songId is required");
  return api.post(`${BASE}/${encodeURIComponent(songId)}/legend`, {});
}

/** Get simple stats for a song (likes/comments) - optional helper
 * @param {string} songId
 */
export async function getSongStats(songId) {
  if (!songId) throw new Error("songId is required");
  return api.get(`${BASE}/${encodeURIComponent(songId)}/stats`);
}

/** Add comment (calls comment API but convenience kept here)
 * @param {string} songId
 * @param {string} text
 */
export async function addComment(songId, text) {
  if (!songId) throw new Error("songId is required");
  return api.post(`${BASE}/${encodeURIComponent(songId)}/comments`, { text });
}

/** Like / unlike a song (toggle)
 * @param {string} songId
 */
export async function likeSong(songId) {
  if (!songId) throw new Error("songId is required");
  return api.post(`${BASE}/${encodeURIComponent(songId)}/like`, {});
}

/** Export default object */
const songsApi = {
  listSongs,
  searchSongs,
  getSong,
  createSong,
  ingestFromSource,
  updateSong,
  deleteSong,
  setLegend,
  getSongStats,
  addComment,
  likeSong,
};

export default songsApi;
