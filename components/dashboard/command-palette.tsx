"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { searchTasks, quickCreateTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { List } from "@/lib/queries/lists";

const OPEN_EVENT = "flowlist:open-command-palette";

type SearchResult = { id: string; title: string; list_id: string; completed: boolean };

const itemClass =
  "cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 aria-selected:bg-indigo-50 aria-selected:text-indigo-700 dark:text-slate-200 dark:aria-selected:bg-indigo-500/10 dark:aria-selected:text-indigo-300";
const groupHeadingClass =
  "px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600";

export function CommandPalette({
  lists,
  defaultListId,
}: {
  lists: List[];
  defaultListId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function openPalette() {
      setOpen(true);
    }
    window.addEventListener(OPEN_EVENT, openPalette);
    return () => window.removeEventListener(OPEN_EVENT, openPalette);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);

      if (typing || open || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "1") {
        e.preventDefault();
        router.push("/dashboard");
      } else if (e.key === "2") {
        e.preventDefault();
        router.push("/dashboard/today");
      } else if (e.key === "3") {
        e.preventDefault();
        router.push("/dashboard/upcoming");
      } else if (e.key === "4") {
        e.preventDefault();
        router.push("/dashboard/calendar");
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  useEffect(() => {
    // Stale results from a previous query are harmless to leave in state —
    // the render below only shows the "Tasks" group while `query` is
    // non-empty, so nothing stale is ever visible.
    if (!query.trim()) return;
    const handle = setTimeout(() => {
      startTransition(async () => {
        const data = await searchTasks(query);
        setResults(data);
      });
    }, 150);
    return () => clearTimeout(handle);
  }, [query]);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery("");
      router.push(path);
    },
    [router],
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="relative"
      overlayClassName="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] animate-overlay-in"
      contentClassName="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-palette-in dark:border-slate-800 dark:bg-slate-900"
    >
      <Command.Input
        value={query}
        onValueChange={setQuery}
        autoFocus
        placeholder="Search tasks, jump to a view…"
        className="w-full border-b border-slate-100 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:text-slate-100"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-slate-400">
          No results.
        </Command.Empty>

        {query.trim() && results.length > 0 && (
          <Command.Group heading="Tasks" className={groupHeadingClass}>
            {results.map((r) => (
              <Command.Item
                key={r.id}
                value={`task-${r.id}-${r.title}`}
                onSelect={() => go(`/dashboard/lists/${r.list_id}?task=${r.id}`)}
                className={itemClass}
              >
                {r.completed ? "✓ " : ""}
                {r.title}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {query.trim() && (
          <Command.Group heading="Create" className={groupHeadingClass}>
            <Command.Item
              value={`create-${query}`}
              onSelect={() => {
                const title = query.trim();
                setOpen(false);
                setQuery("");
                startTransition(async () => {
                  await quickCreateTask(title, defaultListId);
                });
              }}
              className={itemClass}
            >
              Create task &ldquo;{query.trim()}&rdquo;
            </Command.Item>
          </Command.Group>
        )}

        <Command.Group heading="Navigate" className={groupHeadingClass}>
          <Command.Item value="nav-all" onSelect={() => go("/dashboard")} className={itemClass}>
            All tasks
          </Command.Item>
          <Command.Item value="nav-today" onSelect={() => go("/dashboard/today")} className={itemClass}>
            Today
          </Command.Item>
          <Command.Item value="nav-upcoming" onSelect={() => go("/dashboard/upcoming")} className={itemClass}>
            Upcoming
          </Command.Item>
          <Command.Item value="nav-calendar" onSelect={() => go("/dashboard/calendar")} className={itemClass}>
            Calendar
          </Command.Item>
          {lists.map((list) => (
            <Command.Item
              key={list.id}
              value={`nav-list-${list.name}`}
              onSelect={() => go(`/dashboard/lists/${list.id}`)}
              className={itemClass}
            >
              {list.name}
            </Command.Item>
          ))}
          <Command.Item value="nav-account" onSelect={() => go("/dashboard/account")} className={itemClass}>
            Account &amp; billing
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
