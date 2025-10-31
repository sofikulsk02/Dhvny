// src/api/client.js
/**
 * Lightweight fetch-based API client for Dhvny frontend
 *
 * - No external deps (works with fetch)
 * - Stores auth token in localStorage under key 'dhvny_token'
 * - Exports: setAuthToken, clearAuthToken, request, get, post, put, del
 *
 * Usage:
 *   import api from "../api/client";
 *   await api.post("/auth/login", { email, password });
 *
 * If you want global 401 handling, call `setOnUnauthorized(callback)` to handle 401s (for example: redirect to login).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api"; // configure in .env if you host a backend

const TOKEN_KEY = "dhvny_token";

let authToken =
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
let onUnauthorized = null;

/**
 * Set JWT / bearer token for requests. Also persists to localStorage.
 * @param {string} token
 */
export function setAuthToken(token) {
  authToken = token;
  try {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    // ignore storage errors in some environments
  }
}

/** Clear auth token from memory + storage */
export function clearAuthToken() {
  authToken = null;
  try {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

/**
 * Provide a callback that runs when the server responds with 401.
 * Useful to trigger logout/redirect from AuthContext.
 * @param {() => void} cb
 */
export function setOnUnauthorized(cb) {
  onUnauthorized = cb;
}

/** Internal: build headers for requests */
function buildHeaders(isJson = true, extra = {}) {
  const headers = {
    ...extra,
  };
  if (isJson) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  return headers;
}

/**
 * Generic request wrapper
 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} method
 * @param {string} path  - path relative to API_BASE (e.g. '/auth/login')
 * @param {Object|null} body - JS object or FormData (if FormData, isJson should be false)
 * @param {Object} options - { isJson: boolean, headers: {}, query: {} }
 */
export async function request(method, path, body = null, options = {}) {
  const { isJson = true, headers: extraHeaders = {}, query = {} } = options;

  const url = new URL(API_BASE + path, window?.location?.origin);
  // append query params if provided
  Object.keys(query || {}).forEach((k) => {
    const v = query[k];
    if (v === undefined || v === null) return;
    url.searchParams.set(k, String(v));
  });

  const headers = buildHeaders(isJson, extraHeaders);

  const fetchOptions = {
    method,
    headers,
    credentials: "same-origin", // adjust to 'include' if using cookies across domains
  };

  if (body != null) {
    if (body instanceof FormData) {
      // If body is FormData, remove default Content-Type header so browser sets boundary
      delete headers["Content-Type"];
      fetchOptions.body = body;
    } else if (isJson) {
      fetchOptions.body = JSON.stringify(body);
    } else {
      fetchOptions.body = body;
    }
  }

  let res;
  try {
    res = await fetch(url.toString(), fetchOptions);
  } catch (err) {
    // network error (no connection, CORS blocks, DNS)
    const e = new Error("Network error");
    e.cause = err;
    e.type = "network";
    throw e;
  }

  // Basic 401 handling
  if (res.status === 401) {
    if (typeof onUnauthorized === "function") {
      try {
        onUnauthorized();
      } catch (e) {
        /* ignore */
      }
    }
    const e = new Error("Unauthorized");
    e.status = 401;
    throw e;
  }

  // No content
  if (res.status === 204) {
    return null;
  }

  // Try parse JSON; fall back to text
  const contentType = res.headers.get("Content-Type") || "";
  const isResJson = contentType.includes("application/json");

  if (!res.ok) {
    // parse error body if possible
    let bodyData = null;
    try {
      bodyData = isResJson ? await res.json() : await res.text();
    } catch (e) {
      bodyData = null;
    }
    const err = new Error(
      bodyData?.message || `Request failed with status ${res.status}`
    );
    err.status = res.status;
    err.body = bodyData;
    throw err;
  }

  try {
    return isResJson ? await res.json() : await res.text();
  } catch (e) {
    // parsing error — return raw text
    try {
      return await res.text();
    } catch (err) {
      return null;
    }
  }
}

/** Convenience methods */
export function get(path, options = {}) {
  return request("GET", path, null, options);
}

export function post(path, body = {}, options = {}) {
  return request("POST", path, body, options);
}

export function put(path, body = {}, options = {}) {
  return request("PUT", path, body, options);
}

export function del(path, options = {}) {
  return request("DELETE", path, null, options);
}

/** Default export with helpers */
const api = {
  request,
  get,
  post,
  put,
  del,
  setAuthToken,
  clearAuthToken,
  setOnUnauthorized,
  TOKEN_KEY,
  API_BASE,
};

export default api;
