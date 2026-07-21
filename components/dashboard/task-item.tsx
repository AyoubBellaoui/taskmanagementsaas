import Link from "next/link";
import { toggleTaskComplete } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { TaskWithTags } from "@/lib/queries/tasks";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
  none: "bg-transparent",
};

function formatDueDate(dueDate: string) {
  const date = new Date(`${dueDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TaskItem({
  task,
  basePath,
}: {
  task: TaskWithTags;
  basePath: string;
}) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const isOverdue = !!task.due_date && task.due_date < todayISO && !task.completed;

  return (
    <div className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-950">
      <form action={toggleTaskComplete}>
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            task.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          {task.completed ? "✓" : ""}
        </button>
      </form>

      {task.priority !== "none" && (
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`}
          title={`${task.priority} priority`}
        />
      )}

      <Link
        href={`${basePath}?task=${task.id}`}
        className={`min-w-0 flex-1 truncate text-sm ${
          task.completed ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-200"
        }`}
      >
        {task.title}
      </Link>

      {task.tags.length > 0 && (
        <div className="hidden shrink-0 gap-1 sm:flex">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {task.due_date && (
        <span
          className={`shrink-0 text-xs ${
            isOverdue ? "font-medium text-red-600" : "text-zinc-400"
          }`}
        >
          {formatDueDate(task.due_date)}
        </span>
      )}
    </div>
  );
}
