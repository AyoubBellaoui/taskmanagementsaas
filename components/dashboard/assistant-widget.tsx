"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendAssistantMessage, type AssistantMessage } from "@/app/(dashboard)/dashboard/assistant/actions";

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6L10 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M2 8h11.5M9 3.5L14 8l-5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AssistantWidget({ isPro }: { isPro: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    const previous = messages;
    setInput("");
    setError(null);
    setMessages([...previous, { role: "user", content: text }]);

    startTransition(async () => {
      const result = await sendAssistantMessage(previous, text);
      if (result.error) {
        setError(result.error);
        setMessages(previous);
        return;
      }
      setMessages(result.history);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="AI assistant"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500"
      >
        <SparkleIcon />
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex h-[520px] w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-panel-in dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
            >
              <CloseIcon />
            </button>
          </div>

          {!isPro ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">The AI assistant is a Pro feature.</p>
              <Link
                href="/pricing"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                {messages.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-600">
                    Ask me about your tasks — try &quot;what&apos;s due today&quot; or &quot;add a task to buy milk
                    tomorrow&quot;.
                  </p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "self-end bg-indigo-600 text-white"
                        : "self-start bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {isPending && (
                  <div className="self-start rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400 dark:bg-slate-900 dark:text-slate-600">
                    Thinking…
                  </div>
                )}
                {error && <p className="self-start text-xs text-rose-600 dark:text-rose-400">{error}</p>}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-slate-100 px-3 py-3 dark:border-slate-800"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your tasks…"
                  disabled={isPending}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
                />
                <button
                  type="submit"
                  disabled={isPending || !input.trim()}
                  aria-label="Send"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
                >
                  <SendIcon />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
