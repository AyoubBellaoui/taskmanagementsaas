"use client";

import { useState } from "react";
import { TaskItem } from "@/components/dashboard/task-item";
import { SortableTaskList } from "@/components/dashboard/sortable-task-list";
import { useSelection } from "@/components/dashboard/selection-context";
import type { TaskWithTags } from "@/lib/queries/tasks";
import type { Tag } from "@/lib/queries/tags";
import type { Priority } from "@/lib/supabase/types";

type SortKey = "manual" | "due" | "priority" | "alpha";

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };
const selectClass =
  "rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400";

function sortTasks(tasks: TaskWithTags[], sortBy: SortKey): TaskWithTags[] {
  if (sortBy === "manual") return tasks;
  const copy = [...tasks];
  if (sortBy === "alpha") copy.sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === "priority") copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  if (sortBy === "due") {
    copy.sort((a, b) => (a.due_date ?? "9999-99-99").localeCompare(b.due_date ?? "9999-99-99"));
  }
  return copy;
}

function groupByList(tasks: TaskWithTags[]) {
  const groups = new Map<string, { list: TaskWithTags["list"]; tasks: TaskWithTags[] }>();
  for (const task of tasks) {
    const key = task.list?.id ?? "none";
    if (!groups.has(key)) groups.set(key, { list: task.list, tasks: [] });
    groups.get(key)!.tasks.push(task);
  }
  return Array.from(groups.values());
}

function PlainRows({ tasks, basePath }: { tasks: TaskWithTags[]; basePath: string }) {
  const { selectMode, isSelected, toggleSelected } = useSelection();
  return (
    <div className="flex flex-col gap-0.5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          basePath={basePath}
          selectMode={selectMode}
          selected={isSelected(task.id)}
          onToggleSelect={() => toggleSelected(task.id)}
        />
      ))}
    </div>
  );
}

export function InteractiveTaskList({
  tasks,
  basePath,
  emptyMessage = "Nothing here.",
  grouped = false,
  reorderable = false,
  availableTags = [],
}: {
  tasks: TaskWithTags[];
  basePath: string;
  emptyMessage?: string;
  grouped?: boolean;
  reorderable?: boolean;
  availableTags?: Tag[];
}) {
  const [sortBy, setSortBy] = useState<SortKey>(reorderable ? "manual" : "due");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-14 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path d="M8 12.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="4" width="16" height="16" rx="4" />
          </svg>
        </span>
        <p className="text-sm text-slate-400 dark:text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  let visible = tasks;
  if (filterPriority !== "all") visible = visible.filter((t) => t.priority === filterPriority);
  if (filterTag !== "all") visible = visible.filter((t) => t.tags.some((tag) => tag.id === filterTag));
  visible = sortTasks(visible, sortBy);

  const useDnd = reorderable && sortBy === "manual" && filterPriority === "all" && filterTag === "all";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 px-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className={selectClass}
        >
          {reorderable && <option value="manual">Manual order</option>}
          <option value="due">Sort: due date</option>
          <option value="priority">Sort: priority</option>
          <option value="alpha">Sort: A–Z</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className={selectClass}
        >
          <option value="all">All priorities</option>
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
        {availableTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className={selectClass}
          >
            <option value="all">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="px-2 py-6 text-sm text-slate-400 dark:text-slate-600">
          No tasks match these filters.
        </p>
      ) : grouped ? (
        <div className="flex flex-col gap-6">
          {groupByList(visible).map((group) => (
            <div key={group.list?.id ?? "none"}>
              <h2 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                {group.list?.name ?? "No list"}
              </h2>
              <PlainRows tasks={group.tasks} basePath={basePath} />
            </div>
          ))}
        </div>
      ) : useDnd ? (
        <SortableTaskList tasks={visible} basePath={basePath} />
      ) : (
        <PlainRows tasks={visible} basePath={basePath} />
      )}
    </div>
  );
}
