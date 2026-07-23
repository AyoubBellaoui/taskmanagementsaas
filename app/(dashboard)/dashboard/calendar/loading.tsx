export default function Loading() {
  return (
    <div className="px-6 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-7 w-28 animate-pulse rounded-md bg-slate-100 dark:bg-slate-900" />
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-[100px] animate-pulse bg-white dark:bg-slate-950" />
        ))}
      </div>
    </div>
  );
}
