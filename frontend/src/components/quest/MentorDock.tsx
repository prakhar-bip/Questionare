import type { Blueprint, StudentProfile } from "@/lib/types";
import { Mentor } from "./Mentor";

export function MentorDock({
  profile,
  blueprint,
  askSeed,
  onAsked,
  open,
  onToggle,
}: {
  profile: StudentProfile;
  blueprint: Blueprint;
  askSeed?: { text: string; n: number } | null;
  onAsked?: () => void;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <div
        className={`w-[min(92vw,26rem)] origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl shadow-[0_10px_0_0_var(--border)]">
          <Mentor
            profile={profile}
            blueprint={blueprint}
            askSeed={open ? (askSeed ?? null) : null}
            onAsked={onAsked ?? (() => {})}
            compact
            onClose={() => onToggle(false)}
          />
        </div>
      </div>

      <button
        onClick={() => onToggle(!open)}
        aria-expanded={open}
        className="pop-btn flex items-center gap-2 rounded-full bg-grape px-4 py-3 text-sm font-bold text-grape-foreground"
      >
        <svg viewBox="0 0 40 40" className="size-7 shrink-0">
          <circle cx="20" cy="20" r="16" fill="currentColor" opacity="0.25" />
          <circle cx="14" cy="18" r="2.5" fill="currentColor" />
          <circle cx="26" cy="18" r="2.5" fill="currentColor" />
          <path d="M13 26 q7 5 14 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {open ? "Hide mentor" : "Ask your mentor"}
      </button>
    </div>
  );
}
