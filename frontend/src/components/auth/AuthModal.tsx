import React, { useState } from "react";
import { Mascot } from "@/components/quest/Mascot";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
  onSuccess?: () => void;
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "login",
  onSuccess,
}: AuthModalProps) {
  const { login, register, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setErrorMsg(null);
    }
  }, [open, defaultTab]);

  // Switch tabs cleanly
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
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please check your credentials.");
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
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    continueAsGuest(fullName || undefined);
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-2 border-foreground bg-card p-6 shadow-[8px_8px_0_0_var(--foreground)] sm:p-8">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border-2 border-foreground bg-accent/25 shadow-[3px_3px_0_0_var(--foreground)]">
            <Mascot className="size-10" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight sm:text-3xl">
            {tab === "login" ? "Welcome back, Scholar" : "Join Sarthi AI"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
            {tab === "login"
              ? "Sign in to access your saved capstone project blueprints and AI mentor."
              : "Create your student account to discover, score and architect your capstone."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="mt-4 flex rounded-xl border-2 border-foreground bg-sunken p-1 font-display">
          <button
            type="button"
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 rounded-lg py-2 text-xs font-extrabold transition-all duration-200 sm:text-sm ${
              tab === "login"
                ? "border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("register")}
            className={`flex-1 rounded-lg py-2 text-xs font-extrabold transition-all duration-200 sm:text-sm ${
              tab === "register"
                ? "border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-3 rounded-lg border-2 border-destructive bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={tab === "login" ? handleLoginSubmit : handleRegisterSubmit}
          className="mt-4 space-y-3.5"
        >
          {tab === "register" && (
            <div className="space-y-1">
              <label className="mono-label text-[11px] font-bold text-foreground">
                Your Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border-2 border-foreground bg-background py-2.5 pl-10 pr-3 text-sm font-medium transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="mono-label text-[11px] font-bold text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-foreground bg-background py-2.5 pl-10 pr-3 text-sm font-medium transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="mono-label text-[11px] font-bold text-foreground">
                Password
              </label>
              {tab === "register" && (
                <span className="mono-label text-[10px] text-muted-foreground">
                  min 6 chars
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-foreground bg-background py-2.5 pl-10 pr-10 text-sm font-medium transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pop-btn w-full bg-accent py-3 font-display text-sm font-extrabold text-accent-foreground disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                {tab === "login" ? "Signing In..." : "Creating Account..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                {tab === "login" ? "Sign In" : "Create Account & Start"}
                <ArrowRight className="size-4" />
              </span>
            )}
          </button>
        </form>

        {/* Guest Fast-Track Option */}
        <div className="mt-5 border-t border-border pt-4 text-center">
          <p className="mono-label mb-2.5 text-[11px] text-muted-foreground">
            or test immediately without signing up
          </p>
          <button
            type="button"
            onClick={handleGuestContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/40 bg-sunken/60 py-2.5 text-xs font-bold text-foreground transition-all hover:border-foreground hover:bg-sunken"
          >
            <Sparkles className="size-3.5 text-accent" />
            Continue as Guest / Evaluator
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" />
          <span>Secured with JWT & Supabase PostgreSQL encryption</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
