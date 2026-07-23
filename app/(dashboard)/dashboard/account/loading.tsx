export default function Loading() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-1 h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
      <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
    </div>
  );
}
