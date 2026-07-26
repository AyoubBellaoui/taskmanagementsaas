import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 py-8 dark:border-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 text-xs text-slate-400 sm:flex-row dark:text-slate-600">
        <span>© {new Date().getFullYear()} Flowlist.</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hover:text-slate-600 dark:hover:text-slate-400">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-slate-600 dark:hover:text-slate-400">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
