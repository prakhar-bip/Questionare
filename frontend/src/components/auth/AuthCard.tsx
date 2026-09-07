import React, { useState } from "react";
import { Mascot } from "@/components/quest/Mascot";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";

interface AuthCardProps {
  onStartJourney: () => void;
  className?: string;
}

export function AuthCard({ onStartJourney, className = "" }: AuthCardProps) {
  const { user, isAuthenticated, login, register, continueAsGuest, logout } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSwitch = (newTab: "login" | "register") => {
    setTab(newTab);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onStartJourney();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Please provide an email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      onStartJourney();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest(fullName || undefined);
    onStartJourney();
  };

  // If already logged in, show student profile card with quick start
  if (isAuthenticated && user) {
    return (
      <div className={`panel q-pop border-3 border-foreground bg-card p-6 shadow-[6px_6px_0_0_var(--foreground)] ${className}`}>
        <div className="flex items-center gap-3 border-b-2 border-border pb-4">
          <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-foreground bg-accent text-accent-foreground font-display text-lg font-black shadow-[2px_2px_0_0_var(--foreground)]">
            {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-display text-base font-extrabold sm:text-lg">
                {user.fullName || user.email.split("@")[0]}
              </span>
              <span className="mono-label rounded-md bg-success/20 px-1.5 py-0.5 text-[9px] font-bold text-success-foreground border border-success/30">
                {user.isGuest ? "Guest" : "Verified Student"}
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your Sarthi AI session is active. Ready to discover tailored project ideas and run your reality check?
          </p>
          <button
            onClick={onStartJourney}
            className="pop-btn w-full bg-accent py-3 font-display text-base font-extrabold text-accent-foreground"
          >
            Launch Project Discovery →
          </button>
          <div className="flex items-center justify-between pt-1">
            <span className="mono-label text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-success" />
              Authenticated Session
            </span>
            <button
              onClick={logout}
              className="mono-label flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
              title="Log Out of Sarthi"
            >
              <LogOut className="size-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel q-rise border-3 border-foreground bg-card p-5 sm:p-7 shadow-[6px_6px_0_0_var(--foreground)] ${className}`}>
      <div className="mb-4 text-center">
        <span className="mono-label inline-block bg-accent/20 px-2.5 py-1 text-accent-foreground border border-accent/40 rounded-full mb-1.5">
          Student Authentication
        </span>
        <h3 className="font-display text-xl sm:text-2xl font-black">
          {tab === "register" ? "Create Student Account" : "Sign in to Sarthi"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {tab === "register"
            ? "Save your answers, scored ideas, and blueprint."
            : "Resume your final-year engineering project journey."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border-2 border-foreground bg-sunken p-1 font-display mb-4">
        <button
          type="button"
          onClick={() => handleTabSwitch("register")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold transition-all duration-200 ${
            tab === "register"
              ? "border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0_0_var(--foreground)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          New Student
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("login")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold transition-all duration-200 ${
            tab === "login"
              ? "border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0_0_var(--foreground)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
        </button>
      </div>

      {errorMsg && (
        <div className="mb-3 rounded-lg border-2 border-destructive bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={tab === "login" ? handleLoginSubmit : handleRegisterSubmit}
        className="space-y-3"
      >
        {tab === "register" && (
          <div className="space-y-1">
            <label className="mono-label text-[10px] font-bold text-foreground">
              Your Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Arjun Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border-2 border-foreground bg-background py-2 pl-9 pr-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="mono-label text-[10px] font-bold text-foreground">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-foreground bg-background py-2 pl-9 pr-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="mono-label text-[10px] font-bold text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-foreground bg-background py-2 pl-9 pr-9 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="pop-btn w-full bg-accent py-2.5 font-display text-sm font-extrabold text-accent-foreground disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-3.5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              Authenticating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {tab === "register" ? "Sign Up & Begin →" : "Sign In & Continue →"}
            </span>
          )}
        </button>
      </form>

      {/* Guest Fast-Track */}
      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={handleGuest}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-foreground/30 bg-sunken py-2 text-xs font-semibold text-foreground hover:border-foreground transition-all"
        >
          <Sparkles className="size-3 text-accent" />
          <span>Continue as Guest / Evaluator</span>
        </button>
      </div>
    </div>
  );
}
