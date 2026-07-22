"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteList } from "@/app/(dashboard)/dashboard/lists/actions";
import { NewListForm } from "@/components/dashboard/new-list-form";
import { ConfirmSubmitButton } from "@/components/dashboard/confirm-submit-button";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { openCommandPalette } from "@/components/dashboard/command-palette";
import type { List } from "@/lib/queries/lists";
import type { PlanTier } from "@/lib/supabase/types";

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13 13l-2.5-2.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
      <path d="M6.5 11h1M9.5 11h1M12.5 11h1M6.5 14h1M9.5 14h1" strokeLinecap="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M3 8h3.5l1.4 2h4.2l1.4-2H17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 8L5 4h10l1.5 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v6.5a1 1 0 001 1h12a1 1 0 001-1V8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TodayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
      <circle cx="10" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UpcomingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
      <path d="M7.7 13.2l2.3-2.2 2.3 2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Count({ value, active }: { value: number; active?: boolean }) {
  if (!value) return null;
  return (
    <span
      className={`text-xs tabular-nums ${
        active ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 dark:text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}

function NavLink({
  href,
  icon,
  count,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
      )}
      <span className={active ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 dark:text-slate-500"}>
        {icon}
      </span>
      <span className="flex-1 truncate">{children}</span>
      <Count value={count} active={active} />
    </Link>
  );
}

export function Sidebar({
  lists,
  listCounts,
  viewCounts,
  plan,
  email,
}: {
  lists: List[];
  listCounts: Record<string, number>;
  viewCounts: { all: number; today: number; upcoming: number };
  plan: PlanTier;
  email: string;
}) {
  const pathname = usePathname();
  const initial = email.charAt(0).toUpperCase();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white py-4 shadow-[1px_0_0_0_rgba(15,23,42,0.02)] dark:border-slate-800/80 dark:bg-slate-950">
      <div className="flex items-center gap-2 px-4 pb-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
          F
        </span>
        <Link href="/" className="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
          Flowlist
        </Link>
      </div>

      <div className="px-2 pb-3">
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-left text-xs text-slate-400 hover:border-slate-300 hover:text-slate-500 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-400"
        >
          <SearchIcon />
          <span className="flex-1">Search</span>
          <span className="rounded border border-slate-200 px-1 font-mono text-[10px] dark:border-slate-700">
            ⌘K
          </span>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        <NavLink href="/dashboard" icon={<InboxIcon />} count={viewCounts.all}>
          All tasks
        </NavLink>
        <NavLink href="/dashboard/today" icon={<TodayIcon />} count={viewCounts.today}>
          Today
        </NavLink>
        <NavLink href="/dashboard/upcoming" icon={<UpcomingIcon />} count={viewCounts.upcoming}>
          Upcoming
        </NavLink>
        <NavLink href="/dashboard/calendar" icon={<CalendarIcon />} count={0}>
          Calendar
        </NavLink>
      </nav>

      <div className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
          Lists
        </p>
        {lists.map((list) => {
          const href = `/dashboard/lists/${list.id}`;
          const active = pathname === href;
          const count = listCounts[list.id] ?? 0;
          return (
            <div
              key={list.id}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-500/10"
                  : "hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: list.color || "#94a3b8" }}
              />
              <Link
                href={href}
                className={`min-w-0 flex-1 truncate text-sm ${
                  active
                    ? "font-medium text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {list.name}
              </Link>
              {!list.is_default && (
                <form action={deleteList} className="hidden group-hover:block">
                  <input type="hidden" name="id" value={list.id} />
                  <ConfirmSubmitButton
                    confirmText={`Delete "${list.name}" and all its tasks?`}
                    className="px-0.5 text-xs text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </ConfirmSubmitButton>
                </form>
              )}
              <Count value={count} active={active} />
            </div>
          );
        })}
        <NewListForm />
      </div>

      <div className="mt-4 border-t border-slate-100 px-2 pt-3 dark:border-slate-800/80">
        <Link
          href="/dashboard/account"
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
            {email}
          </span>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              plan === "pro"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {plan}
          </span>
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
