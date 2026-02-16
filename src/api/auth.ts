const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export async function loginWithTelegram(initData: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Auth failed (${res.status})`);
  }

  return res.json();
}

export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  return res.json();
}
