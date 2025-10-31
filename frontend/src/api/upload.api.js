import client from "./client";

/**
 * Upload a new song with audio file and optional cover image
 * @param {Object} songData - { title, artist, album?, duration, tags?, genre?, lyrics? }
 * @param {File} audioFile - Audio file (required)
 * @param {File} coverFile - Cover image file (optional)
 * @returns {Promise<Object>} - { success, message, song }
 */
export const uploadSong = async (songData, audioFile, coverFile = null) => {
  const formData = new FormData();

  // Append song metadata
  Object.keys(songData).forEach((key) => {
    if (songData[key] !== undefined && songData[key] !== null) {
      if (key === "tags" && Array.isArray(songData[key])) {
        formData.append(key, JSON.stringify(songData[key]));
      } else {
        formData.append(key, songData[key]);
      }
    }
  });

  // Append files
  formData.append("audio", audioFile);
  if (coverFile) {
    formData.append("cover", coverFile);
  }

  // Use client.post but don't pass axios-specific options
  const response = await client.post("/upload/song", formData, {
    isJson: false, // FormData handles its own content type
  });

  return response;
};

/**
 * Upload user avatar
 * @param {File} avatarFile - Image file
 * @returns {Promise<Object>} - { success, message, avatarUrl }
 */
export const uploadAvatar = async (avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const response = await client.post("/upload/avatar", formData, {
    isJson: false, // FormData handles its own content type
  });

  return response;
};

const uploadApi = {
  uploadSong,
  uploadAvatar,
};

export default uploadApi;
