"use client";

import { useOptimistic, useTransition } from "react";
import { NewTaskForm } from "@/components/dashboard/new-task-form";
import { TaskList } from "@/components/dashboard/task-list";
import { InteractiveTaskList } from "@/components/dashboard/interactive-task-list";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { SelectionProvider } from "@/components/dashboard/selection-context";
import { BulkActionBar } from "@/components/dashboard/bulk-action-bar";
import { TaskListOptimisticContext } from "@/components/dashboard/task-list-optimistic-context";
import type { TaskWithTags } from "@/lib/queries/tasks";
import type { List } from "@/lib/queries/lists";
import type { Tag } from "@/lib/queries/tags";
import type { Priority, Recurrence } from "@/lib/supabase/types";

export function TaskBoard({
  title,
  tasks,
  completedTasks = [],
  lists,
  availableTags = [],
  basePath,
  detailPanel,
  emptyMessage = "Nothing here. Enjoy the quiet.",
  defaultListId,
  defaultDueDate,
  grouped = false,
  reorderable = false,
}: {
  title: string;
  tasks: TaskWithTags[];
  completedTasks?: TaskWithTags[];
  lists: List[];
  availableTags?: Tag[];
  basePath: string;
  detailPanel?: React.ReactNode;
  emptyMessage?: string;
  defaultListId?: string;
  defaultDueDate?: string;
  grouped?: boolean;
  reorderable?: boolean;
}) {
  // Shows a just-submitted task immediately (before createTask resolves) and
  // hides a just-deleted one immediately (before deleteTask resolves) —
  // otherwise both only reflect on screen after a full server round trip,
  // which reads as laggy. Once real data comes back through revalidation,
  // `tasks` updates and this overlay is discarded automatically.
  const [optimisticTasks, dispatchOptimisticTask] = useOptimistic(
    tasks,
    (state, action: { type: "add"; task: TaskWithTags } | { type: "remove"; id: string }) =>
      action.type === "add"
        ? [action.task, ...state]
        : state.filter((t) => t.id !== action.id),
  );
  const [, startTransition] = useTransition();

  function handleOptimisticCreate(data: {
    title: string;
    listId: string;
    dueDate?: string;
    priority?: string;
    recurrence?: string;
  }) {
    const list = lists.find((l) => l.id === data.listId);
    const now = new Date().toISOString();
    const optimisticTask: TaskWithTags = {
      id: `optimistic-${Math.random().toString(36).slice(2)}`,
      user_id: "",
      list_id: data.listId,
      parent_task_id: null,
      title: data.title,
      notes: null,
      due_date: data.dueDate ?? null,
      priority: (data.priority as Priority) ?? "none",
      recurrence: (data.recurrence as Recurrence) ?? "none",
      completed: false,
      completed_at: null,
      position: -1,
      created_at: now,
      updated_at: now,
      tags: [],
      list: list ? { id: list.id, name: list.name, color: list.color } : null,
    };
    startTransition(() => {
      dispatchOptimisticTask({ type: "add", task: optimisticTask });
    });
  }

  function removeOptimisticTask(id: string) {
    startTransition(() => {
      dispatchOptimisticTask({ type: "remove", id });
    });
  }

  return (
    <TaskListOptimisticContext.Provider value={{ removeTask: removeOptimisticTask }}>
      <div className="flex h-full">
        <SelectionProvider>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
                {optimisticTasks.length > 0 && (
                  <span className="text-sm tabular-nums text-slate-400 dark:text-slate-600">
                    {optimisticTasks.length}
                  </span>
                )}
              </div>
              <BulkActionBar lists={lists} />
            </div>

            <NewTaskForm
              lists={lists}
              defaultListId={defaultListId}
              defaultDueDate={defaultDueDate}
              onOptimisticCreate={handleOptimisticCreate}
            />

            <InteractiveTaskList
              tasks={optimisticTasks}
              basePath={basePath}
              lists={lists}
              emptyMessage={emptyMessage}
              grouped={grouped}
              reorderable={reorderable}
              availableTags={availableTags}
            />

            <CollapsibleSection label="Completed" count={completedTasks.length}>
              <TaskList tasks={completedTasks} basePath={basePath} lists={lists} />
            </CollapsibleSection>
          </div>

          {detailPanel}
        </SelectionProvider>
      </div>
    </TaskListOptimisticContext.Provider>
  );
}
