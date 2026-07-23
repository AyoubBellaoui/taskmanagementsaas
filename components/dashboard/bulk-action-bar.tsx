"use client";

import { useTransition } from "react";
import { useSelection } from "@/components/dashboard/selection-context";
import { useToast } from "@/components/dashboard/toast-context";
import {
  bulkCompleteTasks,
  bulkDeleteTasks,
  bulkMoveTasks,
} from "@/app/(dashboard)/dashboard/tasks/actions";
import type { List } from "@/lib/queries/lists";

function plural(count: number) {
  return count === 1 ? "task" : "tasks";
}

export function BulkActionBar({ lists }: { lists: List[] }) {
  const { selectMode, selectedIds, toggleSelectMode, clearSelection } = useSelection();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const count = selectedIds.length;

  if (!selectMode) {
    return (
      <button
        type="button"
        onClick={toggleSelectMode}
        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
      >
        Select
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
        {count} selected
      </span>
      <button
        type="button"
        disabled={isPending || count === 0}
        onClick={() =>
          startTransition(async () => {
            await bulkCompleteTasks(selectedIds);
            showToast(`${count} ${plural(count)} completed`);
            clearSelection();
          })
        }
        className="rounded-md px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
      >
        Complete
      </button>
      <select
        disabled={isPending || count === 0}
        value=""
        onChange={(e) => {
          const listId = e.target.value;
          if (!listId) return;
          const listName = lists.find((l) => l.id === listId)?.name ?? "list";
          startTransition(async () => {
            await bulkMoveTasks(selectedIds, listId);
            showToast(`${count} ${plural(count)} moved to ${listName}`);
            clearSelection();
          });
        }}
        className="rounded-md border border-indigo-200 bg-transparent px-2 py-1 text-xs text-indigo-700 disabled:opacity-40 dark:border-indigo-500/30 dark:text-indigo-300"
      >
        <option value="">Move to…</option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isPending || count === 0}
        onClick={() => {
          if (!window.confirm(`Delete ${count} ${plural(count)}? This can't be undone.`)) return;
          startTransition(async () => {
            await bulkDeleteTasks(selectedIds);
            showToast(`${count} ${plural(count)} deleted`);
            clearSelection();
          });
        }}
        className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-40 dark:hover:bg-rose-500/10"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={toggleSelectMode}
        className="ml-auto rounded-md px-2 py-1 text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200"
      >
        Cancel
      </button>
    </div>
  );
}
