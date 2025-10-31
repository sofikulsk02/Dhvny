// src/api/auth.api.js
/**
 * Lightweight auth API wrapper for Dhvny frontend.
 * Uses src/api/client.js for network requests.
 *
 * Expected endpoints (adjust if your backend differs):
 *  POST /auth/login      -> { token: '...', user: {...} } OR { accessToken: '...', user: {...} }
 *  POST /auth/register   -> { token: '...', user: {...} } or created user object
 *  GET  /auth/me         -> { user: {...} } OR {...user...}
 *
 * The wrapper normalizes responses.
 */

import api from "./client";

const BASE = "/auth";

async function login(payload) {
  // payload: { email|username, password }
  const res = await api.post(`${BASE}/login`, payload);
  // normalize: some backends return { token, user } others { accessToken, user }
  const token = res?.token ?? res?.accessToken ?? res?.data?.token ?? null;
  const user = res?.user ?? res?.data?.user ?? res ?? null;
  return { token, user };
}

async function register(payload) {
  // payload: { username, email, password, displayName, avatarFile? }
  // If uploading a file you'd send FormData externally; this assumes JSON register
  const res = await api.post(`${BASE}/register`, payload);
  const token = res?.token ?? res?.accessToken ?? null;
  const user = res?.user ?? res ?? null;
  return { token, user };
}

async function me() {
  // returns normalized user object
  const res = await api.get(`${BASE}/me`);
  const user = res?.user ?? res ?? null;
  return user;
}

/**
 * Optional convenience to logout on server (not strictly necessary).
 */
async function logout() {
  try {
    await api.post(`${BASE}/logout`);
  } catch (e) {
    // ignore network / not implemented
  }
  return true;
}

const authApi = {
  login,
  register,
  me,
  logout,
};

export default authApi;
