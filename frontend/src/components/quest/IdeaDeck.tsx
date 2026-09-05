import { useState } from "react";
import type { ProjectIdea } from "@/lib/types";

const RARITY: Record<string, { label: string; cls: string }> = {
  legendary: { label: "best match", cls: "bg-xp text-xp-foreground" },
  epic: { label: "strong match", cls: "bg-grape text-grape-foreground" },
  rare: { label: "good match", cls: "bg-primary text-primary-foreground" },
  common: { label: "worth a look", cls: "bg-sunken text-muted-foreground" },
};

const METRICS: { key: keyof ProjectIdea["match"]; label: string }[] = [
  { key: "skill", label: "Skill" },
  { key: "interest", label: "Interest" },
  { key: "feasibility", label: "Feasible" },
  { key: "career", label: "Career" },
  { key: "portfolio", label: "Portfolio" },
  { key: "time", label: "Time" },
];

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mono-label mb-1 flex justify-between">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-border bg-background">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out ${
            value >= 75 ? "bg-leaf" : value >= 55 ? "bg-primary" : "bg-accent"
          }`}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function IdeaCard({
  idea,
  index,
  selected,
  onSelect,
  onFeedback,
  busy,
}: {
  idea: ProjectIdea;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onFeedback: (action: string) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rarity = RARITY[idea.rarity ?? "common"] ?? RARITY["common"]!;

  return (
    <article
      className={`panel card-lift q-pop relative flex flex-col overflow-hidden ${
        selected ? "border-accent" : ""
      }`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-3 border-b-2 border-border bg-sunken px-5 py-4">
        <div>
          <span className={`mono-label rounded-full px-2 py-0.5 ${rarity.cls}`}>{rarity.label}</span>
          <h3 className="mt-2 font-display text-xl font-extrabold leading-tight">{idea.name}</h3>
          <p className="text-xs text-muted-foreground">{idea.tagline}</p>
        </div>
        <div className="shrink-0 text-center">
          <div className="grid size-14 place-items-center rounded-full border-2 border-foreground bg-background font-display text-xl font-extrabold">
            {idea.overall}
          </div>
          <span className="mono-label">match</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-5 py-4 text-sm">
        <p>
          <span className="mono-label mr-1.5">problem</span>
          {idea.problem}
        </p>
        <p>
          <span className="mono-label mr-1.5">solution</span>
          {idea.solution}
        </p>
        <p>
          <span className="mono-label mr-1.5">for</span>
          {idea.targetUsers}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="rounded-full border-2 border-border px-2.5 py-0.5 text-xs font-semibold">
            {idea.difficulty}
          </span>
          <span className="rounded-full border-2 border-border px-2.5 py-0.5 text-xs font-semibold">
            {idea.estimatedTime}
          </span>
          {idea.requiredSkills.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              {s}
            </span>
          ))}
        </div>

        <button onClick={() => setOpen((o) => !o)} className="mono-label underline underline-offset-4">
          {open ? "hide compatibility" : "show compatibility"}
        </button>

        <div
          className={`grid overflow-hidden transition-all duration-400 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 sm:grid-cols-3">
              {METRICS.map((m) => (
                <Meter key={m.key} label={m.label} value={idea.match?.[m.key] ?? 0} />
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-background p-3 text-xs leading-relaxed">
              <span className="mono-label mr-1.5">why you</span>
              {idea.why}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t-2 border-border bg-sunken px-5 py-4">
        <button
          onClick={onSelect}
          disabled={busy}
          className="pop-btn w-full bg-accent py-2.5 text-sm font-bold text-accent-foreground"
        >
          {selected ? "Selected — checking if it fits" : "Choose this project"}
        </button>
        <div className="flex flex-wrap gap-1.5">
          {(
          [
            ["More like this", "give me similar ideas"],
            ["Harder", "make it more advanced"],
            ["Simpler", "give me a simpler version"],
            ["Switch domain", "change the project domain"],
          ] as [string, string][]
          ).map(([label, action]) => (
            <button
              key={label}
              onClick={() => onFeedback(action)}
              disabled={busy}
              className="mono-label rounded-full border-2 border-border bg-background px-2.5 py-1 transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function IdeaDeck({
  ideas,
  selectedId,
  busy,
  onSelect,
  onFeedback,
  onReroll,
}: {
  ideas: ProjectIdea[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (idea: ProjectIdea) => void;
  onFeedback: (idea: ProjectIdea, action: string) => void;
  onReroll: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-extrabold">Ideas picked for you</h2>
          <p className="text-sm text-muted-foreground">
            Each idea is scored against your profile. Not convinced? Ask for different ones.
          </p>
        </div>
        <button
          onClick={onReroll}
          disabled={busy}
          className="pop-btn bg-grape px-5 py-2.5 text-sm font-bold text-grape-foreground"
        >
          {busy ? "Finding ideas…" : "Show me new ideas"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {ideas.map((idea, i) => (
          <IdeaCard
            key={idea.id + i}
            idea={idea}
            index={i}
            selected={selectedId === idea.id}
            busy={busy}
            onSelect={() => onSelect(idea)}
            onFeedback={(action) => onFeedback(idea, action)}
          />
        ))}
      </div>
    </section>
  );
}
