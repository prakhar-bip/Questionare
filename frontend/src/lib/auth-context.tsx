import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "./types";
import { apiLogin, apiRegister, apiFetchMe } from "./auth-api";
import { toast } from "sonner";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  continueAsGuest: (name?: string) => void;
  logout: () => void;
}

const AUTH_USER_KEY = "sarthi_auth_user_v1";
const AUTH_TOKEN_KEY = "sarthi_auth_token_v1";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUserStr = localStorage.getItem(AUTH_USER_KEY);
      if (savedToken && savedUserStr) {
        const parsedUser: AuthUser = JSON.parse(savedUserStr);
        setUser(parsedUser);
        setToken(savedToken);

        // Verify with server in background if not guest
        if (!parsedUser.isGuest) {
          apiFetchMe(savedToken)
            .then((serverUser) => {
              if (serverUser) {
                setUser(serverUser);
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(serverUser));
              } else {
                // Token invalid or expired on server: strictly clear session
                setUser(null);
                setToken(null);
                try {
                  localStorage.removeItem(AUTH_TOKEN_KEY);
                  localStorage.removeItem(AUTH_USER_KEY);
                  localStorage.removeItem("sarthi.journey.v1");
                  localStorage.removeItem("questline.journey.v1");
                } catch {
                  /* ignore */
                }
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("sarthi:session_cleared"));
                }
                toast.error("Session expired or invalid. Please sign in to continue.");
              }
            })
            .catch(() => {
              // keep cached user on temporary network offline
            });
        }
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage events (e.g. session cleared in another tab or dev tools)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === AUTH_USER_KEY) {
        if (!e.newValue) {
          // Token or user was removed
          setUser(null);
          setToken(null);
          try {
            localStorage.removeItem("sarthi.journey.v1");
            localStorage.removeItem("questline.journey.v1");
          } catch {
            /* ignore */
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("sarthi:session_cleared"));
          }
          toast.info("Session was cleared. Please sign in to access your project.");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      toast.success(`Welcome back, ${res.user.fullName || res.user.email}!`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(email, password, fullName);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      toast.success(`Account created! Welcome to Sarthi, ${res.user.fullName}!`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const continueAsGuest = useCallback((name?: string) => {
    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      email: "guest@sarthi.internal",
      fullName: name?.trim() || "Guest Explorer",
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    const guestToken = `guest_token_${Date.now()}`;
    setUser(guestUser);
    setToken(guestToken);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, guestToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    } catch {
      /* ignore */
    }
    toast.info("Exploring in Guest Mode! You can create a permanent account anytime.");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem("sarthi.journey.v1");
      localStorage.removeItem("questline.journey.v1");
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sarthi:session_cleared"));
    }
    toast.success("Logged out successfully. Please sign in to continue.");
  }, []);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
