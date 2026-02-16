import { useState, useCallback, useEffect } from "react";
import { loginWithTelegram, refreshTokens, type AuthResponse } from "../api/auth";

const STORAGE_KEY = "auth_tokens";

function loadTokens(): AuthResponse | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: AuthResponse) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function useAuth() {
  const [tokens, setTokens] = useState<AuthResponse | null>(loadTokens);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!tokens?.accessToken;

  const login = useCallback(async (initData: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithTelegram(initData);
      setTokens(result);
      saveTokens(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!tokens?.refreshToken) return;
    try {
      const result = await refreshTokens(tokens.refreshToken);
      setTokens(result);
      saveTokens(result);
    } catch {
      setTokens(null);
      clearTokens();
    }
  }, [tokens?.refreshToken]);

  const logout = useCallback(() => {
    setTokens(null);
    clearTokens();
  }, []);

  // On mount: refresh tokens if saved, otherwise auto-login via Telegram
  useEffect(() => {
    const saved = loadTokens();
    if (saved?.refreshToken) {
      setLoading(true);
      refreshTokens(saved.refreshToken)
        .then((result) => {
          setTokens(result);
          saveTokens(result);
        })
        .catch(() => {
          setTokens(null);
          clearTokens();
          // Fallback to Telegram login
          const tg = window.Telegram?.WebApp;
          if (tg?.initData) {
            login(tg.initData);
          }
        })
        .finally(() => setLoading(false));
    } else {
      const tg = window.Telegram?.WebApp;
      if (tg?.initData) {
        login(tg.initData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh tokens every 10 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(refresh, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  return { tokens, isAuthenticated, loading, error, login, refresh, logout };
}
