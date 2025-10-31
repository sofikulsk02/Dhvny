// src/api/authService.js
/**
 * authService - simple auth helpers for Dhvny frontend
 *
 * Assumes the API endpoints:
 *  - POST /auth/login   -> { token: "...", user: { ... } }
 *  - POST /auth/register-> { token: "...", user: { ... } }
 *  - GET  /auth/me      -> { user: { ... } }
 *  - POST /auth/logout  -> 204 or { ok: true }  (optional)
 *
 * This module relies on src/api/client.js (imported as `api`) to handle
 * the low-level fetch, token persistence, and 401 callbacks.
 */

import api from "./client";

/**
 * Login user
 * @param {{ email?: string, username?: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>} response
 * @throws Error on network / response errors
 */
export async function login(credentials) {
  if (!credentials || !credentials.password) {
    throw new Error("Missing credentials");
  }

  // POST to /auth/login
  const res = await api.post("/auth/login", credentials);

  // expected: { token, user, ... }
  if (res && res.token) {
    api.setAuthToken(res.token);
  }

  return res;
}

/**
 * Register new user
 * @param {{ username: string, email?: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>} response
 */
export async function register(data) {
  if (!data || !data.password || !data.username) {
    throw new Error("Missing registration fields");
  }

  const res = await api.post("/auth/register", data);

  if (res && res.token) {
    api.setAuthToken(res.token);
  }

  return res;
}

/**
 * Logout
 * Clears local token and optionally calls backend logout endpoint.
 * @param {boolean} callServer - whether to call POST /auth/logout (default: false)
 */
export async function logout(callServer = false) {
  try {
    if (callServer) {
      // optional: call server to invalidate refresh token / session
      await api.post("/auth/logout");
    }
  } catch (e) {
    // ignore server logout errors — we still clear token locally
    console.warn("server logout failed", e);
  } finally {
    api.clearAuthToken();
  }
}

/**
 * Get current user's profile from server
 * Useful after page load to validate token & fetch user data.
 * @returns {Promise<{ user: object }>}
 */
export async function getProfile() {
  const res = await api.get("/auth/me");
  return res;
}

/**
 * Set a global handler for 401 Unauthorized responses.
 * The callback can sign out the user or redirect to login.
 * @param {() => void} cb
 */
export function setUnauthorizedHandler(cb) {
  api.setOnUnauthorized(cb);
}

const authService = {
  login,
  register,
  logout,
  getProfile,
  setUnauthorizedHandler,
};

export default authService;
