import type { QuestScroll as Scroll } from "@/lib/types";

export function QuestScrollPanel({
  scroll,
  busy,
  onSummon,
  onAsk,
}: {
  scroll: Scroll | null;
  busy: boolean;
  onSummon: () => void;
  onAsk: (question: string) => void;
}) {
  return (
    <section className="panel q-rise overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-xp px-5 py-4 text-xp-foreground">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="size-9 shrink-0">
            <rect
              x="7"
              y="6"
              width="26"
              height="28"
              rx="3"
              fill="currentColor"
              opacity="0.18"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M13 14 h14 M13 20 h14 M13 26 h9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="q-draw"
            />
          </svg>
          <div>
            <span className="mono-label text-xp-foreground/80">quick summary</span>
            <h3 className="font-display text-xl font-extrabold leading-tight">
              Your plan in short
            </h3>
          </div>
        </div>
        <button
          onClick={onSummon}
          disabled={busy}
          className="pop-btn bg-background px-4 py-2 text-sm font-bold text-foreground"
        >
          {busy ? "Writing…" : scroll ? "Rewrite summary" : "Create summary"}
        </button>
      </div>

      {!scroll && !busy && (
        <p className="px-5 py-5 text-sm text-muted-foreground">
          Create a short summary of the whole plan: a one-minute pitch, your tools, your next three
          steps and the biggest risks ahead.
        </p>
      )}

      {busy && (
        <div className="space-y-2 px-5 py-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="q-shine h-4 rounded-full bg-sunken"
              style={{ width: `${90 - i * 18}%` }}
            />
          ))}
        </div>
      )}

      {scroll && !busy && (
        <div className="space-y-5 px-5 py-5">
          <p className="font-display text-lg font-extrabold leading-snug">{scroll.tldr}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{scroll.pitch}</p>

          {scroll.loadout?.length > 0 && (
            <div>
              <span className="mono-label">tools you'll use</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {scroll.loadout.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border-2 border-border bg-sunken px-3 py-1 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {scroll.keyMoves?.length > 0 && (
              <div>
                <span className="mono-label">key decisions</span>
                <ul className="mt-1.5 space-y-2">
                  {scroll.keyMoves.map((m) => (
                    <li key={m.move} className="text-sm">
                      <span className="font-bold">{m.move}</span>{" "}
                      <span className="text-muted-foreground">— {m.why}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scroll.bossRisks?.length > 0 && (
              <div>
                <span className="mono-label">biggest risks</span>
                <ul className="mt-1.5 space-y-2">
                  {scroll.bossRisks.map((r) => (
                    <li key={r} className="text-sm text-muted-foreground">
                      · {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {scroll.nextThreeMoves?.length > 0 && (
            <div>
              <span className="mono-label">your next three steps</span>
              <ol className="mt-1.5 space-y-1.5">
                {scroll.nextThreeMoves.map((m, i) => (
                  <li key={m} className="flex gap-2 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-foreground bg-accent text-[10px] font-extrabold text-accent-foreground">
                      {i + 1}
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="border-t-2 border-dashed border-border pt-4">
            <span className="mono-label">stuck? ask your mentor</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "Explain step 1 like I've never built this",
                "Which risk should I worry about most?",
                "What would a supervisor grill me on?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onAsk(q)}
                  className="rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-grape hover:text-grape-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
