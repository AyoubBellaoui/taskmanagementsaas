"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { deleteTask, restoreTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import { useToast } from "@/components/dashboard/toast-context";
import { useTaskListOptimisticRemove } from "@/components/dashboard/task-list-optimistic-context";
import type { TaskWithTags } from "@/lib/queries/tasks";

// Shared by the detail panel's Delete button and the row context menu.
// Deletes immediately (no confirm dialog) and offers an "Undo" toast instead
// — only navigates away from `basePath` if the deleted task is the one
// currently open in the side panel.
export function useDeleteTaskWithUndo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const removeOptimistic = useTaskListOptimisticRemove();

  return (task: TaskWithTags, basePath: string) => {
    // Note: subtasks aren't captured in this snapshot, so undoing the delete
    // of a parent task with subtasks won't bring those back — an accepted
    // gap given how rarely that combination occurs.
    const snapshot = {
      title: task.title,
      notes: task.notes,
      listId: task.list_id,
      dueDate: task.due_date,
      priority: task.priority,
      recurrence: task.recurrence,
      tagIds: task.tags.map((t) => t.id),
    };

    if (searchParams.get("task") === task.id) {
      router.push(basePath);
    }

    // Removes the row from the list immediately instead of waiting on the
    // deleteTask round trip + revalidation — the toast already implied it
    // was gone, but the row itself used to linger until the server responded.
    removeOptimistic?.(task.id);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", task.id);
      await deleteTask(formData);
    });

    showToast("Task deleted", {
      actionLabel: "Undo",
      onAction: () => startTransition(() => restoreTask(snapshot)),
    });
  };
}

export function DeleteTaskButton({
  task,
  basePath,
}: {
  task: TaskWithTags;
  basePath: string;
}) {
  const deleteWithUndo = useDeleteTaskWithUndo();

  return (
    <button
      type="button"
      onClick={() => deleteWithUndo(task, basePath)}
      className="text-sm text-rose-600 hover:underline"
    >
      Delete
    </button>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path
        d="M3.5 5h9M6.5 5V3.5a1 1 0 011-1h1a1 1 0 011 1V5M4.5 5l.6 8.1a1 1 0 001 .9h3.8a1 1 0 001-.9L11.5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Compact icon-only variant for inline rows (subtasks) where the text
// "Delete" link would be too wide — same delete+undo behavior, just a
// smaller, hover-revealed target.
export function DeleteTaskIconButton({
  task,
  basePath,
}: {
  task: TaskWithTags;
  basePath: string;
}) {
  const deleteWithUndo = useDeleteTaskWithUndo();

  return (
    <button
      type="button"
      onClick={() => deleteWithUndo(task, basePath)}
      aria-label={`Delete "${task.title}"`}
      className="ml-auto shrink-0 rounded-md p-1 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
    >
      <TrashIcon />
    </button>
  );
}
