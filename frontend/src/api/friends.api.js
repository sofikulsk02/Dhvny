import api from "./client";

/**
 * Send a friend request to a user
 * @param {string} recipientId - User ID to send request to
 */
export async function sendFriendRequest(recipientId) {
  return api.post("/friends/request", { recipientId });
}

/**
 * Accept a friend request
 * @param {string} requestId - Friend request ID
 */
export async function acceptFriendRequest(requestId) {
  return api.post(`/friends/accept/${requestId}`, {});
}

/**
 * Reject a friend request
 * @param {string} requestId - Friend request ID
 */
export async function rejectFriendRequest(requestId) {
  return api.post(`/friends/reject/${requestId}`, {});
}

/**
 * Remove a friend
 * @param {string} friendId - Friend's user ID
 */
export async function removeFriend(friendId) {
  return api.del(`/friends/${friendId}`);
}

/**
 * Get all friends (accepted friendships)
 */
export async function getFriends() {
  return api.get("/friends");
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingRequests() {
  return api.get("/friends/requests/pending");
}

/**
 * Get sent friend requests
 */
export async function getSentRequests() {
  return api.get("/friends/requests/sent");
}

/**
 * Check friendship status with a user
 * @param {string} userId - User ID to check status with
 */
export async function getFriendshipStatus(userId) {
  return api.get(`/friends/status/${userId}`);
}

const friendsApi = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getFriendshipStatus,
};

export default friendsApi;
