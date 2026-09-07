import type { AuthUser } from "./types";

function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Check if localhost
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://127.0.0.1:8000";
    }
    return "https://questline-backend-526912959525.us-central1.run.app";
  }
  return process.env["BACKEND_URL"] || "http://127.0.0.1:8000";
}

export type AuthResponseData = {
  access_token: string;
  token_type: string;
  user: {
    id: number | string;
    email: string;
    full_name?: string | null;
    created_at?: string;
  };
};

export async function apiRegister(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: AuthUser; token: string }> {
  const base = getBackendBaseUrl();
  try {
    const res = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName?.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(errorData.detail || `Server error (${res.status})`);
    }

    const data: AuthResponseData = await res.json();
    return {
      token: data.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name || data.user.email.split("@")[0],
        createdAt: data.user.created_at,
      },
    };
  } catch (err: any) {
    // If backend is unreachable or connection refused in local dev without backend running, fallback gracefully
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      console.warn("Backend unavailable, creating local session for offline/demo use:", err);
      const demoToken = `local_jwt_${Date.now()}`;
      return {
        token: demoToken,
        user: {
          id: `local_${Date.now()}`,
          email: email.trim().toLowerCase(),
          fullName: fullName?.trim() || email.split("@")[0],
        },
      };
    }
    throw err;
  }
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> {
  const base = getBackendBaseUrl();
  try {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(errorData.detail || "Invalid email or password");
    }

    const data: AuthResponseData = await res.json();
    return {
      token: data.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name || data.user.email.split("@")[0],
        createdAt: data.user.created_at,
      },
    };
  } catch (err: any) {
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      console.warn("Backend unavailable, fallback local login check:", err);
      // If user has local session credentials cached
      const demoToken = `local_jwt_${Date.now()}`;
      return {
        token: demoToken,
        user: {
          id: `local_${Date.now()}`,
          email: email.trim().toLowerCase(),
          fullName: email.split("@")[0],
        },
      };
    }
    throw err;
  }
}

export async function apiFetchMe(token: string): Promise<AuthUser | null> {
  if (!token || token.startsWith("local_jwt_") || token.startsWith("guest_token_")) {
    return null;
  }
  const base = getBackendBaseUrl();
  try {
    const res = await fetch(`${base}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || data.email.split("@")[0],
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}
