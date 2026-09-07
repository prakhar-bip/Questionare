export function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Sarthi guide mascot">
      <g className="q-float">
        <circle cx="60" cy="60" r="44" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="3" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeDasharray="6 10"
          strokeLinecap="round"
          className="q-spin-slow"
          style={{ transformOrigin: "60px 60px" }}
        />
        <path
          d="M60 26 L70 56 L100 60 L70 64 L60 94 L50 64 L20 60 L50 56 Z"
          fill="var(--xp)"
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="60" r="7" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="3" />
        <circle cx="46" cy="46" r="3" fill="var(--foreground)" />
        <circle cx="74" cy="46" r="3" fill="var(--foreground)" />
      </g>
    </svg>
  );
}

export function SparkLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 40" className={className} aria-hidden="true">
      <path
        d="M4 30 C 60 4, 96 36, 150 18 S 250 4, 316 24"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        className="q-draw"
      />
      <circle cx="150" cy="18" r="5" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="2" />
    </svg>
  );
}
