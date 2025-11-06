import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authApi from "../api/auth.api";
import apiClient from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children, initialFetchUser = true }) {
  const [user, setUser] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // helper: clear client token + local user state
  const clearAuthLocal = useCallback(() => {
    try {
      apiClient.clearAuthToken?.();
    } catch (e) {
      console.log(e.message);
    }
    setUser(null);
    setAuthError(null);
  }, []);

  const logout = useCallback(
    async (opts = {}) => {
      const { server = false } = opts;
      try {
        if (server) {
          await authApi.logout();
        }
      } catch (e) {
        console.log(e);
      }
      clearAuthLocal();
    },
    [clearAuthLocal]
  );

  // auto-logout on 401 wire to api client
  useEffect(() => {
    apiClient.setOnUnauthorized?.(() => {
      clearAuthLocal();
    });
  }, [clearAuthLocal]);

  // login helper
  const login = useCallback(async (credentials = {}) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login(credentials);
      const token = res?.token;
      const userFromRes = res?.user ?? null;
      if (!token && !userFromRes) {
        throw new Error("Invalid login response from server");
      }
      if (token) {
        apiClient.setAuthToken(token);
      }

      // if backend returned user object with token, set it; else fetch me
      let finalUser = userFromRes;
      if (!finalUser) {
        try {
          finalUser = await authApi.me();
        } catch (e) {
          //proceed with null user
          finalUser = null;
        }
      }
      setUser(finalUser);
      setAuthLoading(false);
      return { ok: true, user: finalUser };
    } catch (err) {
      console.error("login failed", err);
      setAuthError(err?.message || String(err));
      setAuthLoading(false);
      return { ok: false, error: err };
    }
  }, []);

  // register helper
  const register = useCallback(async (payload = {}) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.register(payload);
      const token = res?.token;
      const userFromRes = res?.user ?? null;

      if (token) apiClient.setAuthToken(token);

      let finalUser = userFromRes;
      if (!finalUser) {
        try {
          finalUser = await authApi.me();
        } catch (e) {
          finalUser = null;
        }
      }

      setUser(finalUser);
      setAuthLoading(false);
      return { ok: true, user: finalUser };
    } catch (err) {
      console.error("register failed", err);
      setAuthError(err?.message || String(err));
      setAuthLoading(false);
      return { ok: false, error: err };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setTokenLoading(true);
      const u = await authApi.me();
      setUser(u);
      setTokenLoading(false);
      return u;
    } catch (err) {
      setUser(null);
      setTokenLoading(false);
      return null;
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setTokenLoading(true);
      try {
        const maybeUser = await (async () => {
          try {
            return await authApi.me();
          } catch (e) {
            return null;
          }
        })();
        if (!mounted) return;
        if (maybeUser) {
          setUser(maybeUser);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.warn("auth restore failed", e);
        setUser(null);
      } finally {
        if (mounted) setTokenLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [initialFetchUser]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      tokenLoading,
      authLoading,
      authError,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [
      user,
      isAuthenticated,
      tokenLoading,
      authLoading,
      authError,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export default useAuth;
