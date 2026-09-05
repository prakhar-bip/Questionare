import type { StudentProfile } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-border bg-background px-3 py-2">
      <div className="mono-label">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

export function ProfileCard({ p, compact = false }: { p: StudentProfile; compact?: boolean }) {
  return (
    <section className="panel q-rise overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-border bg-sunken px-5 py-4">
        <div>
          <span className="mono-label">player card</span>
          <h2 className="font-display text-xl font-extrabold">{p.name}</h2>
          <p className="text-xs text-muted-foreground">
            {p.fieldOfStudy} · {p.yearOfStudy} · {p.experienceLevel}
          </p>
        </div>
        <svg viewBox="0 0 48 48" className="size-11 shrink-0">
          <polygon
            points="24,4 42,14 42,34 24,44 6,34 6,14"
            fill="var(--primary)"
            stroke="var(--foreground)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <text
            x="24"
            y="30"
            textAnchor="middle"
            fill="var(--primary-foreground)"
            fontSize="16"
            fontFamily="var(--font-display)"
            fontWeight="800"
          >
            {p.name.slice(0, 1).toUpperCase()}
          </text>
        </svg>
      </div>

      <div className="space-y-4 px-5 py-5">
        {p.summary && <p className="text-sm leading-relaxed">{p.summary}</p>}

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Time" value={`${p.hoursPerWeek} h/wk · ${p.weeks} wks`} />
          <Stat label="Team" value={p.teamSize} />
          <Stat label="Goal" value={p.careerGoal || "—"} />
          <Stat label="Appetite" value={p.complexity} />
        </div>

        {!compact && (
          <>
            <div>
              <div className="mono-label mb-1.5">Skills & stack</div>
              <div className="flex flex-wrap gap-1.5">
                {[...p.skills, ...p.languages, ...p.frameworks].map((s) => (
                  <span key={s} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mono-label mb-1.5">Interests</div>
              <div className="flex flex-wrap gap-1.5">
                {[...p.interests, ...p.domains].map((s) => (
                  <span key={s} className="rounded-full bg-accent/18 px-2.5 py-1 text-xs font-medium text-accent">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {p.strengths && (
          <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
            <div className="rounded-xl border-2 border-border bg-background p-3">
              <div className="mono-label mb-1.5">Strengths</div>
              <ul className="space-y-1 text-xs">
                {p.strengths.map((s) => (
                  <li key={s} className="flex gap-1.5">
                    <span className="text-leaf">▲</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-border bg-background p-3">
              <div className="mono-label mb-1.5">Watch-outs</div>
              <ul className="space-y-1 text-xs">
                {(p.watchOuts ?? []).map((s) => (
                  <li key={s} className="flex gap-1.5">
                    <span className="text-accent">▼</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
