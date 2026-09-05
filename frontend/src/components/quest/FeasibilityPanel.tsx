import { useState } from "react";
import type { Feasibility, ProjectIdea } from "@/lib/types";

export function FeasibilityPanel({
  idea,
  f,
  busy,
  onChoose,
  onBack,
}: {
  idea: ProjectIdea;
  f: Feasibility;
  busy: boolean;
  onChoose: (direction: string, label: string) => void;
  onBack: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Can you realistically finish {idea.name}?</h2>
      </div>

      <div className="panel q-rise overflow-hidden">
        <div
          className={`flex items-center gap-4 border-b-2 border-border px-6 py-5 ${
            f.achievable ? "bg-leaf/25" : "bg-accent/20"
          }`}
        >
          <svg viewBox="0 0 56 56" className="size-12 shrink-0">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill={f.achievable ? "var(--leaf)" : "var(--accent)"}
              stroke="var(--foreground)"
              strokeWidth="3"
            />
            <path
              d={f.achievable ? "M17 29 l8 8 l15 -17" : "M28 15 v20 M28 41 v1"}
              fill="none"
              stroke="var(--primary-foreground)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="q-draw"
              style={{ strokeDasharray: 60, strokeDashoffset: 60 }}
            />
          </svg>
          <div>
            <span className="mono-label">{f.achievable ? "achievable" : "risky as scoped"}</span>
            <p className="font-display text-xl font-extrabold">{f.verdict}</p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-5 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{f.reasoning}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-border bg-background p-3">
                <div className="mono-label mb-1">time</div>
                <p className="text-xs">{f.timeVerdict}</p>
              </div>
              <div className="rounded-xl border-2 border-border bg-background p-3">
                <div className="mono-label mb-1">resources</div>
                <p className="text-xs">{f.resourceVerdict}</p>
              </div>
            </div>
            <div>
              <div className="mono-label mb-1.5">skills to learn</div>
              <div className="flex flex-wrap gap-1.5">
                {f.skillGaps.map((s) => (
                  <span key={s} className="rounded-full bg-accent/18 px-2.5 py-1 text-xs font-medium text-accent">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-border bg-background p-4">
            <div className="mono-label mb-3">learning plan</div>
            <ol className="relative space-y-3">
              <span className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-border" />
              {f.learningRoadmap.map((step, i) => (
                <li key={step.skill} className="relative pl-9">
                  <span className="absolute left-0 top-0 grid size-7 place-items-center rounded-full border-2 border-foreground bg-xp font-mono text-[11px] font-bold text-xp-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold">{step.skill}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.how} · ~{step.weeks} wk
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => onChoose("build the project as selected", "as selected")}
          disabled={busy}
          className="panel card-lift px-5 py-4 text-left"
        >
          <span className="mono-label">option a</span>
          <p className="font-display text-lg font-extrabold">Go ahead as planned</p>
          <p className="text-xs text-muted-foreground">Keep the full scope and follow the learning plan.</p>
        </button>
        <button
          onClick={() => onChoose(`build the simplified version: ${f.simplified.name} — ${f.simplified.summary}`, "simplified")}
          disabled={busy}
          className="panel card-lift px-5 py-4 text-left"
        >
          <span className="mono-label">option b · {f.simplified.name}</span>
          <p className="font-display text-lg font-extrabold">Simplify it</p>
          <p className="text-xs text-muted-foreground">{f.simplified.summary}</p>
        </button>
        <button
          onClick={() => onChoose(`switch to the alternative project: ${f.alternative.name} — ${f.alternative.summary}`, "alternative")}
          disabled={busy}
          className="panel card-lift px-5 py-4 text-left"
        >
          <span className="mono-label">option c · {f.alternative.name}</span>
          <p className="font-display text-lg font-extrabold">Switch project</p>
          <p className="text-xs text-muted-foreground">{f.alternative.summary}</p>
        </button>
      </div>

      <div className="panel px-5 py-4">
        <div className="mono-label mb-1.5">option d · tell us what you want changed</div>
        <p className="mb-2 text-xs text-muted-foreground">
          Write your own feedback and we will plan the project your way.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. keep the idea but drop the mobile app, and I only want to use Python…"
          className="w-full resize-none rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => onChoose(`build the project with this student feedback applied: ${note.trim()}`, "your own feedback")}
          disabled={busy || note.trim().length === 0}
          className="pop-btn mt-3 bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-40"
        >
          Use my feedback
        </button>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="mono-label rounded-full border-2 border-border px-4 py-2">
          back to ideas
        </button>
        {busy && <span className="mono-label animate-pulse">building your plan…</span>}
      </div>
    </section>
  );
}
