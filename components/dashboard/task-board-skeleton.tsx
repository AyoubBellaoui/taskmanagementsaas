export function TaskBoardSkeleton() {
  return (
    <div className="px-6 py-6">
      <div className="mb-5 h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mb-5 h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
      <div className="mb-3 flex gap-2">
        <div className="h-6 w-24 animate-pulse rounded-md bg-slate-100 dark:bg-slate-900" />
        <div className="h-6 w-24 animate-pulse rounded-md bg-slate-100 dark:bg-slate-900" />
      </div>
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
