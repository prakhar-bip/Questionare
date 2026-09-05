import Markdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Blueprint, StudentProfile } from "@/lib/types";

const PROMPTS = [
  "I'm stuck on where to start",
  "Explain the hardest part of this plan",
  "Why this tech stack for me?",
  "What could go wrong in week 3?",
  "How do I explain this to my examiner?",
];

export function Mentor({
  profile,
  blueprint,
  askSeed,
  onAsked,
  compact = false,
  onClose,
}: {
  profile: StudentProfile;
  blueprint: Blueprint;
  askSeed?: { text: string; n: number } | null;
  onAsked?: () => void;
  compact?: boolean;
  onClose?: () => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context: { profile, blueprint } },
      }),
    [profile, blueprint],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seenSeed = useRef<number>(-1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    if (status === "ready") inputRef.current?.focus();
  }, [status]);

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() });
    setInput("");
    onAsked?.();
  };

  useEffect(() => {
    if (!askSeed || askSeed.n === seenSeed.current) return;
    seenSeed.current = askSeed.n;
    send(askSeed.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askSeed]);

  const textOf = (m: (typeof messages)[number]) =>
    m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

  return (
    <section className={`panel flex flex-col overflow-hidden ${compact ? "h-[30rem]" : "h-[40rem] lg:h-[46rem]"}`}>
      <div className="flex items-center gap-3 border-b-2 border-border bg-sunken px-5 py-3">
        <svg viewBox="0 0 40 40" className="size-9 shrink-0">
          <circle cx="20" cy="20" r="16" fill="var(--grape)" stroke="var(--foreground)" strokeWidth="3" />
          <circle cx="14" cy="18" r="2.5" fill="var(--grape-foreground)" />
          <circle cx="26" cy="18" r="2.5" fill="var(--grape-foreground)" />
          <path
            d="M13 26 q7 5 14 0"
            fill="none"
            stroke="var(--grape-foreground)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold leading-tight">Your project mentor</p>
          <p className="mono-label truncate">doubts, problems & guidance</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close mentor chat"
            className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-border text-sm font-bold"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This is a place to talk things through — ask your doubts, describe a problem you're
              stuck on, or get advice on how to approach a step.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`q-rise max-w-[88%] text-sm leading-relaxed ${
                m.role === "user"
                  ? "whitespace-pre-wrap rounded-2xl rounded-tr-sm border-2 border-foreground bg-primary px-3.5 py-2.5 text-primary-foreground"
                  : "mentor-md"
              }`}
            >
              {m.role === "user" ? textOf(m) : <Markdown>{textOf(m)}</Markdown>}
            </div>
          </div>
        ))}

        {status === "submitted" && <p className="mono-label animate-pulse">thinking…</p>}
        {error && (
          <p className="rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-xs text-destructive">
            The connection dropped. Please send that again.
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t-2 border-border px-5 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder="Ask a doubt, or describe what you're stuck on…"
            className="flex-1 resize-none rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="pop-btn grid size-10 shrink-0 place-items-center bg-accent text-accent-foreground"
            aria-label="Send message"
          >
            ↑
          </button>
        </form>
      </div>
    </section>
  );
}
