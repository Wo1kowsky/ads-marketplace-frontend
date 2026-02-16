import { refreshTokens, type AuthResponse } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const STORAGE_KEY = "auth_tokens";

function getTokens(): AuthResponse | null {
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

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const tokens = getTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && tokens?.refreshToken) {
    try {
      const newTokens = await refreshTokens(tokens.refreshToken);
      saveTokens(newTokens);
      headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    } catch {
      clearTokens();
      window.location.reload();
      throw new Error("Session expired");
    }
  }

  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await authFetch(path, {
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `Request failed (${res.status})`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await authFetch(path, {
    method: "PATCH",
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail ?? `Request failed (${res.status})`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}
