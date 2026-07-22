"use client";

import { useState } from "react";

export function CollapsibleSection({
  label,
  count,
  defaultOpen = false,
  children,
}: {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400"
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="M4 2.5L7.5 6 4 9.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
        <span className="tabular-nums">{count}</span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}
