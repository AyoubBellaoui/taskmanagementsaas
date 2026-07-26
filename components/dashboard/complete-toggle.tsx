"use client";

import { useOptimistic, useTransition } from "react";
import { toggleTaskComplete } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { Priority, Recurrence } from "@/lib/supabase/types";

export type CompleteToggleTask = {
  id: string;
  completed: boolean;
  listId: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: Priority;
  recurrence: Recurrence;
  parentTaskId: string | null;
  tagIds: string[];
};

// Flips the button's own state immediately (via useOptimistic) instead of
// waiting on the full toggleTaskComplete round trip — the plain <form
// action={toggleTaskComplete}> it replaces gave no feedback until the
// server responded, which is what made every checkbox click feel laggy.
//
// className/content are pairs of plain values (not functions) because this
// is rendered from Server Component callers (task-detail-panel.tsx) —
// functions can't cross the server/client boundary as props, only
// serializable values and React elements.
export function CompleteToggle({
  task,
  completeClassName,
  incompleteClassName,
  completeContent,
  incompleteContent,
}: {
  task: CompleteToggleTask;
  completeClassName: string;
  incompleteClassName: string;
  completeContent: React.ReactNode;
  incompleteContent: React.ReactNode;
}) {
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(task.completed);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={optimisticCompleted ? "Mark incomplete" : "Mark complete"}
      onClick={() => {
        const nextCompleted = !optimisticCompleted;
        startTransition(async () => {
          setOptimisticCompleted(nextCompleted);
          await toggleTaskComplete({
            id: task.id,
            completed: nextCompleted,
            listId: task.listId,
            title: task.title,
            notes: task.notes,
            dueDate: task.dueDate,
            priority: task.priority,
            recurrence: task.recurrence,
            parentTaskId: task.parentTaskId,
            tagIds: task.tagIds,
          });
        });
      }}
      className={optimisticCompleted ? completeClassName : incompleteClassName}
    >
      {optimisticCompleted ? completeContent : incompleteContent}
    </button>
  );
}
