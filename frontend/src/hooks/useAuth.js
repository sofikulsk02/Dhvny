// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * useAuth.js
 * - Separate hook file so Fast Refresh stays happy.
 * - Returns the value from AuthContext (user, setUser, login, logout).
 */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // helpful dev-time guard
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
