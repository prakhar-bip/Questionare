import type { Blueprint } from "@/lib/types";

function Section({
  tag,
  title,
  children,
  delay = 0,
}: {
  tag: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section className="panel q-rise overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="border-b-2 border-border bg-sunken px-5 py-3">
        <span className="mono-label">{tag}</span>
        <h3 className="font-display text-xl font-extrabold">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function BlueprintView({
  b,
  changeLog,
  onGeneratePrototype,
  isGeneratingPrototype = false,
}: {
  b: Blueprint;
  changeLog: string[];
  onGeneratePrototype?: () => void;
  isGeneratingPrototype?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="panel q-rise overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-primary px-6 py-5 text-primary-foreground">
          <div>
            <span className="mono-label text-primary-foreground/80">your complete project plan</span>
            <h2 className="font-display text-3xl font-extrabold">{b.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {onGeneratePrototype && (
              <button
                onClick={onGeneratePrototype}
                disabled={isGeneratingPrototype}
                className="btn-brutal flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-sm"
              >
                <span>⚡</span>
                <span>{isGeneratingPrototype ? "Building Prototype..." : "Manifest Prototype"}</span>
              </button>
            )}
            <svg viewBox="0 0 90 40" className="h-10 w-24">
              <path
                d="M4 32 h18 v-14 h18 v-10 h18 v24 h28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="q-draw"
              />
            </svg>
          </div>
        </div>
        <div className="grid gap-4 px-6 py-5 lg:grid-cols-2">
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed">{b.overview.summary}</p>
            <div className="rounded-xl border-2 border-border bg-background p-3">
              <div className="mono-label mb-1">problem statement</div>
              <p className="text-xs leading-relaxed">{b.overview.problemStatement}</p>
            </div>
            <div className="rounded-xl border-2 border-border bg-background p-3">
              <div className="mono-label mb-1">proposed solution</div>
              <p className="text-xs leading-relaxed">{b.overview.proposedSolution}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-border bg-background p-3">
              <div className="mono-label mb-1.5">objectives</div>
              <ul className="space-y-1 text-xs">
                {b.overview.objectives.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="text-accent">◆</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-border bg-background p-3">
                <div className="mono-label mb-1">target users</div>
                <p className="text-xs">{b.overview.targetUsers}</p>
              </div>
              <div className="rounded-xl border-2 border-border bg-background p-3">
                <div className="mono-label mb-1">expected impact</div>
                <p className="text-xs">{b.overview.expectedImpact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Section tag="must have" title="Core features" delay={60}>
          <ul className="space-y-2.5">
            {b.mvpFeatures.map((f) => (
              <li key={f.name} className="rounded-xl border-2 border-border bg-background p-3">
                <p className="text-sm font-semibold">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section tag="nice to have" title="Advanced features" delay={120}>
          <ul className="space-y-2.5">
            {b.advancedFeatures.map((f) => (
              <li key={f.name} className="rounded-xl border-2 border-border bg-background p-3">
                <p className="text-sm font-semibold">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section tag="later" title="Future improvements" delay={180}>
          <ul className="space-y-2 text-sm">
            {b.futureImprovements.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-grape">★</span>
                {f}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section tag="tech stack" title="Recommended tools" delay={60}>
        <div className="grid gap-3 md:grid-cols-2">
          {b.stack.map((t) => (
            <div key={t.name} className="card-lift rounded-xl border-2 border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-extrabold">{t.name}</p>
                <span
                  className={`mono-label rounded-full px-2 py-0.5 ${
                    t.isNew ? "bg-accent text-accent-foreground" : "bg-leaf/30"
                  }`}
                >
                  {t.isNew ? "new to learn" : "you know this"}
                </span>
              </div>
              <p className="mono-label mt-1">{t.category}</p>
              <p className="mt-2 text-xs leading-relaxed">
                <span className="font-semibold">Why: </span>
                {t.why}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold">How: </span>
                {t.howUsed}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tag="how it fits together" title="High-level architecture" delay={90}>
        <div className="flex flex-wrap items-stretch gap-3">
          {b.architecture.layers.map((l, i) => (
            <div key={l.name} className="flex items-center gap-3">
              <div className="min-w-44 rounded-xl border-2 border-foreground bg-background p-3 shadow-[0_4px_0_0_var(--border)]">
                <p className="mono-label">layer {i + 1}</p>
                <p className="font-display text-sm font-extrabold">{l.name}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {l.parts.map((p) => (
                    <li key={p} className="text-xs text-muted-foreground">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
              {i < b.architecture.layers.length - 1 && (
                <svg viewBox="0 0 32 10" className="h-3 w-8 text-primary">
                  <line
                    x1="0"
                    y1="5"
                    x2="30"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="q-dash"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-background p-3 text-xs leading-relaxed">
          <span className="mono-label mr-1.5">data flow</span>
          {b.architecture.dataFlow}
        </p>
      </Section>

      <Section tag="timeline" title="Development roadmap" delay={120}>
        <ol className="relative space-y-4">
          <span className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-border" />
          {b.roadmap.map((r, i) => (
            <li key={r.phase + i} className="relative pl-11">
              <span className="absolute left-0 top-0 grid size-8 place-items-center rounded-full border-2 border-foreground bg-primary font-mono text-[11px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-display text-base font-extrabold">{r.title}</p>
                <span className="mono-label rounded-full bg-sunken px-2 py-0.5">{r.weeks}</span>
              </div>
              <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                {r.tasks.map((t) => (
                  <li key={t} className="flex gap-1.5 text-xs text-muted-foreground">
                    <span className="text-accent">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section tag="watch out" title="Challenges & solutions" delay={150}>
        <div className="grid gap-3 md:grid-cols-2">
          {b.challenges.map((c) => (
            <div key={c.challenge} className="rounded-xl border-2 border-border bg-background p-3">
              <p className="text-sm font-semibold text-accent">{c.challenge}</p>
              <p className="mt-1 text-xs leading-relaxed">{c.solution}</p>
            </div>
          ))}
        </div>
      </Section>

      {changeLog.length > 0 && (
        <Section tag="revision history" title="Plan updates" delay={60}>
          <ol className="space-y-2">
            {changeLog.map((c, i) => (
              <li key={c + i} className="flex gap-2 text-xs">
                <span className="mono-label">update {i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {onGeneratePrototype && (
        <div className="panel q-rise border-2 border-accent bg-gradient-to-r from-accent/15 via-background to-accent/5 p-6 sm:p-8 text-center space-y-4">
          <span className="mono-label rounded-full bg-accent/20 px-3 py-1 font-bold text-accent">
            NEXT PHASE: THE GANDIVA SUITE
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to turn this blueprint into working software?
          </h3>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Sarthi will synthesize your architecture, MVP features, and data flow into an interactive in-browser prototype and a multi-file starter codebase ready to download.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onGeneratePrototype}
              disabled={isGeneratingPrototype}
              className="btn-brutal flex items-center gap-2.5 bg-accent px-6 py-3 text-base font-extrabold text-accent-foreground shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-xl">⚡</span>
              <span>{isGeneratingPrototype ? "Manifesting Prototype with Sarthi AI..." : "Manifest Working Prototype →"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
