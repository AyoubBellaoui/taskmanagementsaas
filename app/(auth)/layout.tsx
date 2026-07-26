import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-16 dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-[120px] dark:bg-indigo-500/25"
      />
      <Link
        href="/"
        className="group relative mb-8 flex items-center gap-2"
        aria-label="Back to homepage"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
          F
        </span>
        <span className="text-[15px] font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400">
          Flowlist
        </span>
      </Link>
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950">
        {children}
      </div>
    </div>
  );
}
