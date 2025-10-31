import api from "./client";

/**
 * Get comments for a song
 * @param {string} songId
 * @param {{ page?: number, limit?: number }} opts
 */
export async function getComments(songId, opts = {}) {
  const { page = 1, limit = 20 } = opts;
  return api.get(`/songs/${songId}/comments`, { query: { page, limit } });
}

/**
 * Create a comment on a song
 * @param {string} songId
 * @param {string} content
 * @param {string|null} parentComment - Parent comment ID for replies
 */
export async function createComment(songId, content, parentComment = null) {
  return api.post(`/songs/${songId}/comments`, { content, parentComment });
}

/**
 * Update a comment
 * @param {string} commentId
 * @param {string} content
 */
export async function updateComment(commentId, content) {
  return api.put(`/comments/${commentId}`, { content });
}

/**
 * Delete a comment
 * @param {string} commentId
 */
export async function deleteComment(commentId) {
  return api.del(`/comments/${commentId}`);
}

/**
 * Toggle like on a comment
 * @param {string} commentId
 */
export async function toggleCommentLike(commentId) {
  return api.post(`/comments/${commentId}/like`, {});
}

const commentsApi = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
};

export default commentsApi;
