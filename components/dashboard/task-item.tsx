import Link from "next/link";
import { CompleteToggle } from "@/components/dashboard/complete-toggle";
import { DeleteTaskIconButton } from "@/components/dashboard/delete-task-button";
import type { TaskWithTags } from "@/lib/queries/tasks";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
  none: "bg-transparent",
};

type DueTier = "overdue" | "soon" | "later";

const DUE_STYLES: Record<DueTier, string> = {
  overdue: "text-rose-600 dark:text-rose-400 font-medium",
  soon: "text-amber-600 dark:text-amber-500",
  later: "text-sky-600 dark:text-sky-400",
};

function dueTier(dueDate: string): DueTier {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "soon";
  return "later";
}

function formatDueDate(dueDate: string) {
  const date = new Date(`${dueDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
      <path d="M2.5 7.2l3 3 6-6.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
      <path d="M3 7V5.5A2.5 2.5 0 015.5 3H12M12 3l-2-2M12 3l-2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9v1.5A2.5 2.5 0 0110.5 13H4M4 13l2 2M4 13l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3 shrink-0">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4.2V7l1.8 1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TaskItem({
  task,
  basePath,
  dragHandle,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: {
  task: TaskWithTags;
  basePath: string;
  dragHandle?: React.ReactNode;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
      {dragHandle}

      {selectMode && (
        <button
          type="button"
          onClick={onToggleSelect}
          aria-label={selected ? "Deselect task" : "Select task"}
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${
            selected
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-slate-300 text-transparent hover:border-indigo-400 dark:border-slate-600"
          }`}
        >
          <CheckIcon />
        </button>
      )}

      <CompleteToggle
        task={{
          id: task.id,
          completed: task.completed,
          listId: task.list_id,
          title: task.title,
          notes: task.notes,
          dueDate: task.due_date,
          priority: task.priority,
          recurrence: task.recurrence,
          parentTaskId: task.parent_task_id,
          tagIds: task.tags.map((t) => t.id),
        }}
        completeClassName="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors border-emerald-500 bg-emerald-500 text-white"
        incompleteClassName="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors border-slate-300 text-transparent hover:border-indigo-400 dark:border-slate-600"
        completeContent={<CheckIcon />}
        incompleteContent={<CheckIcon />}
      />

      {task.priority !== "none" && !task.completed && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`}
          title={`${task.priority} priority`}
        />
      )}

      <Link
        href={`${basePath}?task=${task.id}`}
        className={`min-w-0 flex-1 truncate text-sm ${
          task.completed
            ? "text-slate-400 line-through dark:text-slate-600"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {task.title}
      </Link>

      {task.recurrence !== "none" && (
        <span className="shrink-0 text-slate-400 dark:text-slate-600" title={`Repeats ${task.recurrence}`}>
          <RepeatIcon />
        </span>
      )}

      {task.tags.length > 0 && (
        <div className="hidden shrink-0 gap-1 sm:flex">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {task.due_date && (
        <span
          className={`flex shrink-0 items-center gap-1 text-xs tabular-nums ${
            task.completed ? "text-slate-400 dark:text-slate-600" : DUE_STYLES[dueTier(task.due_date)]
          }`}
        >
          <ClockIcon />
          {formatDueDate(task.due_date)}
        </span>
      )}

      <DeleteTaskIconButton task={task} basePath={basePath} />
    </div>
  );
}
