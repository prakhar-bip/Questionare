import { useState } from "react";

export function PlanChangeBar({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (request: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim() || busy) return;
        onSubmit(text.trim());
        setText("");
      }}
      className="panel q-rise flex flex-wrap items-center gap-3 px-5 py-4"
    >
      <div className="min-w-[12rem] flex-1">
        <div className="mono-label mb-1">change your plan</div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          placeholder="e.g. swap Streamlit for a React front end, or cut one core feature"
          className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="pop-btn bg-xp px-5 py-2.5 text-sm font-bold text-xp-foreground disabled:opacity-50"
      >
        {busy ? "Updating your plan…" : "Update my plan"}
      </button>
    </form>
  );
}
