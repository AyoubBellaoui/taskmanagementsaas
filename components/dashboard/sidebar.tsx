"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteList } from "@/app/(dashboard)/dashboard/lists/actions";
import { NewListForm } from "@/components/dashboard/new-list-form";
import { ConfirmSubmitButton } from "@/components/dashboard/confirm-submit-button";
import { LogoutButton } from "@/components/dashboard/logout-button";
import type { List } from "@/lib/queries/lists";
import type { PlanTier } from "@/lib/supabase/types";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-1.5 text-sm ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      }`}
    >
      {children}
    </Link>
  );
}

export function Sidebar({ lists, plan }: { lists: List[]; plan: PlanTier }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 py-4 dark:border-zinc-900">
      <div className="px-4 pb-4">
        <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Flowlist
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        <NavLink href="/dashboard">All tasks</NavLink>
        <NavLink href="/dashboard/today">Today</NavLink>
        <NavLink href="/dashboard/upcoming">Upcoming</NavLink>
      </nav>

      <div className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
        <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Lists
        </p>
        {lists.map((list) => {
          const href = `/dashboard/lists/${list.id}`;
          const active = pathname === href;
          return (
            <div
              key={list.id}
              className={`group flex items-center justify-between rounded-md ${
                active ? "bg-zinc-900 dark:bg-zinc-50" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Link
                href={href}
                className={`flex-1 truncate px-3 py-1.5 text-sm ${
                  active ? "text-white dark:text-zinc-900" : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {list.name}
              </Link>
              {!list.is_default && (
                <form action={deleteList}>
                  <input type="hidden" name="id" value={list.id} />
                  <ConfirmSubmitButton
                    confirmText={`Delete "${list.name}" and all its tasks?`}
                    className={`hidden px-2 text-xs group-hover:block ${
                      active ? "text-white/70 dark:text-zinc-900/70" : "text-zinc-400"
                    }`}
                  >
                    ✕
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          );
        })}
        <NewListForm />
      </div>

      <div className="mt-4 flex flex-col gap-1 border-t border-zinc-200 px-2 pt-4 dark:border-zinc-900">
        <Link
          href="/dashboard/account"
          className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Account
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase text-zinc-500 dark:bg-zinc-900">
            {plan}
          </span>
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
