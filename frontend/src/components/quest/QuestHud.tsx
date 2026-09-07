import { BADGES, type Stage } from "@/lib/types";
import { Mascot } from "./Mascot";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

const STAGES: { key: Stage; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "profile", label: "Profile" },
  { key: "ideas", label: "Project ideas" },
  { key: "feasibility", label: "Reality check" },
  { key: "blueprint", label: "Your plan" },
  { key: "prototype", label: "Prototype" },
];

export function QuestHud({
  stage,
  badges,
  onReset,
}: {
  stage: Stage;
  badges: string[];
  onReset: () => void;
}) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);
  const pct = Math.round(((activeIndex + 1) / STAGES.length) * 100);
  const { user, logout } = useAuth();


  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Mascot className="size-10 shrink-0" />
          <div className="leading-none">
            <p className="font-display text-lg font-extrabold">Sarthi</p>
            <p className="mono-label mt-1">AI project charioteer & planner</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="w-44">
            <div className="mb-1 flex items-center justify-between">
              <span className="mono-label">Step {Math.max(1, activeIndex + 1)} of {STAGES.length}</span>
              <span className="mono-label">{pct}% ready</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border-2 border-foreground bg-sunken">
              <div
                className="q-shine h-full rounded-full bg-xp transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="hidden items-center gap-1.5 sm:flex">
            {Object.keys(BADGES).map((key) => {
              const earned = badges.includes(key);
              const badge = BADGES[key]!;
              return (
                <span
                  key={key}
                  title={`${badge.label} — ${badge.hint}`}
                  className={`grid size-7 place-items-center rounded-full border-2 border-foreground font-mono text-[10px] font-bold ${
                    earned ? "q-pop bg-grape text-grape-foreground" : "bg-sunken text-muted-foreground opacity-45"
                  }`}
                >
                  {badge.label.slice(0, 1)}
                </span>
              );
            })}
          </div>

          <span className="mono-label hidden rounded-full border-2 border-border bg-sunken px-3 py-1.5 sm:inline-block">
            progress saved
          </span>

          {user && (
            <div className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-accent/20 px-3 py-1.5 text-xs">
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-black text-accent-foreground">
                {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
              </span>
              <span className="max-w-[90px] truncate font-bold text-foreground sm:max-w-[140px]">
                {user.fullName || user.email.split("@")[0]}
              </span>
              <span className="mono-label text-[10px] text-muted-foreground hidden md:inline">
                {user.isGuest ? "· Guest" : "· Student"}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="mono-label flex items-center gap-1.5 rounded-full border-2 border-foreground bg-destructive/15 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-destructive hover:text-destructive-foreground shadow-[2px_2px_0_0_var(--foreground)]"
            title="Log Out of Sarthi"
          >
            <LogOut className="size-3.5" />
            <span>Log Out</span>
          </button>

          <button
            onClick={onReset}
            className="mono-label rounded-full border-2 border-border px-3 py-1.5 transition-colors hover:bg-sunken"
          >
            restart
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl overflow-x-auto px-5 pb-3">
        <ol className="flex min-w-max items-center gap-1">
          {STAGES.map((s, i) => {
            const done = activeIndex > i;
            const active = activeIndex === i;
            return (
              <li key={s.key} className="flex items-center gap-1">
                <span
                  className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    active
                      ? "border-foreground bg-accent text-accent-foreground shadow-[0_3px_0_0_var(--foreground)]"
                      : done
                        ? "border-foreground bg-primary text-primary-foreground"
                        : "border-border bg-sunken text-muted-foreground"
                  }`}
                >
                  <span className="grid size-4 place-items-center rounded-full bg-background/30 font-mono text-[9px]">
                    {done ? "✓" : i + 1}
                  </span>
                  {s.label}
                </span>
                {i < STAGES.length - 1 && (
                  <svg viewBox="0 0 28 8" className="h-2 w-6 text-border">
                    <line
                      x1="0"
                      y1="4"
                      x2="26"
                      y2="4"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={active ? "q-dash" : ""}
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
