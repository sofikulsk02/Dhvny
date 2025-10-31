import api from "./client.js";

/**
 * Create a new jam session
 * @param {Object} data - Jam session data
 * @param {string} data.name - Name of the jam session
 * @param {boolean} data.isPublic - Whether the session is public
 * @param {number} data.maxParticipants - Maximum number of participants
 * @returns {Promise<{success: boolean, jamSession: Object}>}
 */
export const createJamSession = async (data) => {
  return api.post("/jam", data);
};

/**
 * Get all active jam sessions
 * @returns {Promise<{success: boolean, jamSessions: Array}>}
 */
export const getJamSessions = async () => {
  return api.get("/jam");
};

/**
 * Get a specific jam session
 * @param {string} sessionId - Jam session ID
 * @returns {Promise<{success: boolean, jamSession: Object}>}
 */
export const getJamSession = async (sessionId) => {
  return api.get(`/jam/${sessionId}`);
};

/**
 * Join a jam session
 * @param {string} sessionId - Jam session ID
 * @returns {Promise<{success: boolean, jamSession: Object}>}
 */
export const joinJamSession = async (sessionId) => {
  return api.post(`/jam/${sessionId}/join`);
};

/**
 * Leave a jam session
 * @param {string} sessionId - Jam session ID
 * @returns {Promise<{success: boolean}>}
 */
export const leaveJamSession = async (sessionId) => {
  return api.post(`/jam/${sessionId}/leave`);
};

/**
 * End a jam session (host only)
 * @param {string} sessionId - Jam session ID
 * @returns {Promise<{success: boolean}>}
 */
export const endJamSession = async (sessionId) => {
  return api.del(`/jam/${sessionId}`);
};

/**
 * Add a song to jam session queue
 * @param {string} sessionId - Jam session ID
 * @param {string} songId - Song ID to add
 * @returns {Promise<{success: boolean, queue: Array}>}
 */
export const addSongToJamQueue = async (sessionId, songId) => {
  return api.post(`/jam/${sessionId}/queue`, { songId });
};
