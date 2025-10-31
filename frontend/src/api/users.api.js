import api from "./client";

/**
 * Search for users by username or display name
 * @param {string} query - Search query
 */
export async function searchUsers(query) {
  return api.get("/users/search", { query: { q: query } });
}

/**
 * Get user profile by username
 * @param {string} username - Username
 */
export async function getProfileByUsername(username) {
  return api.get(`/users/profile/${username}`);
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 */
export async function getUserProfile(userId) {
  return api.get(`/users/${userId}`);
}

/**
 * Update own profile
 * @param {Object} data - Profile data
 */
export async function updateProfile(data) {
  return api.put("/users/profile", data);
}

/**
 * Update privacy settings
 * @param {Object} settings - Privacy settings
 */
export async function updatePrivacySettings(settings) {
  return api.put("/users/settings/privacy", settings);
}

/**
 * Update notification settings
 * @param {Object} settings - Notification settings
 */
export async function updateNotificationSettings(settings) {
  return api.put("/users/settings/notifications", settings);
}

/**
 * Update playback settings
 * @param {Object} settings - Playback settings
 */
export async function updatePlaybackSettings(settings) {
  return api.put("/users/settings/playback", settings);
}

/**
 * Update appearance settings
 * @param {Object} settings - Appearance settings
 */
export async function updateAppearanceSettings(settings) {
  return api.put("/users/settings/appearance", settings);
}

/**
 * Get user's uploaded songs
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export async function getUserUploads(userId, page = 1, limit = 20) {
  return api.get(`/users/${userId}/uploads`, { query: { page, limit } });
}

/**
 * Get user's liked songs
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export async function getUserLikes(userId, page = 1, limit = 20) {
  return api.get(`/users/${userId}/likes`, { query: { page, limit } });
}

/**
 * Get user's playlists
 * @param {string} userId - User ID
 */
export async function getUserPlaylists(userId) {
  return api.get(`/users/${userId}/playlists`);
}

/**
 * Delete user account
 */
export async function deleteAccount() {
  return api.del("/users/account");
}

/**
 * Upload user avatar
 * @param {File} file - Image file
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return api.put("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

const usersApi = {
  searchUsers,
  getProfileByUsername,
  getUserProfile,
  updateProfile,
  updatePrivacySettings,
  updateNotificationSettings,
  updatePlaybackSettings,
  updateAppearanceSettings,
  getUserUploads,
  getUserLikes,
  getUserPlaylists,
  deleteAccount,
  uploadAvatar,
};

export default usersApi;
