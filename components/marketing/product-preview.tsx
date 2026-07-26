const ROWS: {
  title: string;
  done?: boolean;
  priority?: "high" | "medium" | "low";
  due?: string;
  dueTone?: "overdue" | "soon" | "later";
  tag?: string;
  repeat?: boolean;
}[] = [
  { title: "Design the new dashboard", priority: "high", due: "Today", dueTone: "overdue" },
  { title: "Reply to client feedback", priority: "medium", due: "Tomorrow", dueTone: "soon", tag: "Work" },
  { title: "Weekly team sync", repeat: true, due: "Fri", dueTone: "later" },
  { title: "Ship v1.2", done: true },
];

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
};

const DUE_TONE: Record<string, string> = {
  overdue: "text-rose-500",
  soon: "text-amber-500",
  later: "text-sky-500",
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <path d="M2.5 7.2l3 3 6-6.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
      <path d="M3 7V5.5A2.5 2.5 0 015.5 3H12M12 3l-2-2M12 3l-2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9v1.5A2.5 2.5 0 0110.5 13H4M4 13l2 2M4 13l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductPreview() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(79,70,229,0.25)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-[10px] font-bold text-white">
          F
        </span>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Today</span>
        <span className="text-xs tabular-nums text-slate-400 dark:text-slate-600">3</span>
      </div>

      <div className="flex flex-col gap-0.5 p-3">
        {ROWS.map((row) => (
          <div key={row.title} className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span
              className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                row.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 text-transparent dark:border-slate-600"
              }`}
            >
              <CheckIcon />
            </span>

            {row.priority && !row.done && (
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[row.priority]}`} />
            )}

            <span
              className={`min-w-0 flex-1 truncate text-[13px] ${
                row.done
                  ? "text-slate-400 line-through dark:text-slate-600"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {row.title}
            </span>

            {row.repeat && <span className="shrink-0 text-slate-400 dark:text-slate-600"><RepeatIcon /></span>}

            {row.tag && (
              <span className="hidden shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 sm:block">
                {row.tag}
              </span>
            )}

            {row.due && (
              <span className={`shrink-0 text-[11px] tabular-nums ${row.dueTone ? DUE_TONE[row.dueTone] : "text-slate-400"}`}>
                {row.due}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
