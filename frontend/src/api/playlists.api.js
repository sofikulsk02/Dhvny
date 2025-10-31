import api from "./client";

/**
 * Create a new playlist
 */
export const createPlaylist = async (playlistData) => {
  const response = await api.post("/playlists", playlistData);
  return response;
};

/**
 * Get current user's playlists
 */
export const getMyPlaylists = async () => {
  const response = await api.get("/playlists/my");
  return response;
};

/**
 * Get public playlists
 */
export const getPublicPlaylists = async (limit = 20, skip = 0) => {
  const response = await api.get(
    `/playlists/public?limit=${limit}&skip=${skip}`
  );
  return response;
};

/**
 * Get playlist by ID
 */
export const getPlaylistById = async (playlistId) => {
  const response = await api.get(`/playlists/${playlistId}`);
  return response;
};

/**
 * Update playlist
 */
export const updatePlaylist = async (playlistId, updates) => {
  const response = await api.put(`/playlists/${playlistId}`, updates);
  return response;
};

/**
 * Delete playlist
 */
export const deletePlaylist = async (playlistId) => {
  const response = await api.del(`/playlists/${playlistId}`);
  return response;
};

/**
 * Add song to playlist
 */
export const addSongToPlaylist = async (playlistId, songId) => {
  const response = await api.post(`/playlists/${playlistId}/songs`, { songId });
  return response;
};

/**
 * Remove song from playlist
 */
export const removeSongFromPlaylist = async (playlistId, songId) => {
  const response = await api.del(`/playlists/${playlistId}/songs/${songId}`);
  return response;
};

/**
 * Like/unlike playlist
 */
export const togglePlaylistLike = async (playlistId) => {
  const response = await api.post(`/playlists/${playlistId}/like`);
  return response;
};

/**
 * Get global playlist (visible to all users)
 */
export const getGlobalPlaylist = async () => {
  const response = await api.get("/playlists/global");
  return response;
};

/**
 * Create global playlist (admin only)
 */
export const createGlobalPlaylist = async (playlistData) => {
  const response = await api.post("/playlists/global/create", playlistData);
  return response;
};

/**
 * Add song to global playlist (admin only)
 */
export const addSongToGlobalPlaylist = async (songId) => {
  const response = await api.post("/playlists/global/songs", { songId });
  return response;
};

/**
 * Remove song from global playlist (admin only)
 */
export const removeSongFromGlobalPlaylist = async (songId) => {
  const response = await api.del(`/playlists/global/songs/${songId}`);
  return response;
};

export default {
  createPlaylist,
  getMyPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  togglePlaylistLike,
  getGlobalPlaylist,
  createGlobalPlaylist,
  addSongToGlobalPlaylist,
  removeSongFromGlobalPlaylist,
};
