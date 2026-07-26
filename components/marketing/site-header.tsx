import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-5xl px-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            F
          </span>
          <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">Flowlist</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/pricing" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
            Pricing
          </Link>
          <Link href="/login" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-medium text-white hover:bg-indigo-500"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
