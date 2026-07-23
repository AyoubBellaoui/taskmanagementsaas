import Link from "next/link";
import {
  toggleTaskComplete,
  updateTask,
  createSubtask,
} from "@/app/(dashboard)/dashboard/tasks/actions";
import {
  attachTagToTask,
  createTag,
  detachTagFromTask,
} from "@/app/(dashboard)/dashboard/tags/actions";
import { DeleteTaskButton } from "@/components/dashboard/delete-task-button";
import { getSubtasks, getTaskById } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { getTags } from "@/lib/queries/tags";
import { verifySession } from "@/lib/dal";

const PRIORITY_ICON_COLOR: Record<string, string> = {
  high: "text-rose-500",
  medium: "text-amber-500",
  low: "text-sky-500",
  none: "text-slate-400 dark:text-slate-600",
};

function pillClass(hasValue: boolean) {
  return `flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
    hasValue
      ? "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
      : "border-dashed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600"
  }`;
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
      <path d="M3 4.5h10M3 8h10M3 11.5h6" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
      <path d="M4 2v12" strokeLinecap="round" />
      <path d="M4 3h7l-1.8 2.5L11 8H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
      <path d="M3 7V5.5A2.5 2.5 0 015.5 3H12M12 3l-2-2M12 3l-2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 9v1.5A2.5 2.5 0 0110.5 13H4M4 13l2 2M4 13l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export async function TaskDetailPanel({
  taskId,
  basePath,
}: {
  taskId: string;
  basePath: string;
}) {
  const { userId } = await verifySession();
  const [task, lists, allTags] = await Promise.all([
    getTaskById(userId, taskId),
    getLists(userId),
    getTags(userId),
  ]);

  if (!task) {
    return (
      <aside className="flex h-full w-96 shrink-0 flex-col border-l border-slate-200 bg-white p-6 shadow-xl animate-panel-in dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-400">Task not found.</p>
        <Link href={basePath} className="mt-2 text-sm text-indigo-600 underline dark:text-indigo-400">
          Close
        </Link>
      </aside>
    );
  }

  const subtasks = task.parent_task_id ? [] : await getSubtasks(userId, task.id);
  const attachedTagIds = new Set(task.tags.map((t) => t.id));
  const currentList = lists.find((l) => l.id === task.list_id);

  return (
    <aside className="flex h-full w-96 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl animate-panel-in dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between">
        <form action={toggleTaskComplete}>
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              task.completed
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-300 text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {task.completed ? "Completed" : "Mark complete"}
          </button>
        </form>
        <Link
          href={basePath}
          className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          Close ✕
        </Link>
      </div>

      <form action={updateTask} className="flex flex-col">
        <input type="hidden" name="id" value={task.id} />

        {/* Compact icon-pill toolbar: list, due date, priority, repeat. Native
            select/date inputs kept for real functionality, just styled to
            read as pills rather than a stacked labeled form. */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <label className={pillClass(true)}>
            <ListIcon />
            <select
              name="listId"
              defaultValue={task.list_id}
              className="max-w-[7rem] truncate bg-transparent outline-none"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </label>

          <label className={pillClass(!!task.due_date)}>
            <CalendarIcon />
            <input
              type="date"
              name="dueDate"
              defaultValue={task.due_date ?? ""}
              className="w-[6.5rem] bg-transparent outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
          </label>

          <label className={pillClass(task.priority !== "none")}>
            <span className={PRIORITY_ICON_COLOR[task.priority]}>
              <FlagIcon />
            </span>
            <select name="priority" defaultValue={task.priority} className="bg-transparent outline-none">
              <option value="none">No priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          {!task.parent_task_id && (
            <label className={pillClass(task.recurrence !== "none")}>
              <RepeatIcon />
              <select name="recurrence" defaultValue={task.recurrence} className="bg-transparent outline-none">
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          )}
        </div>

        <input
          name="title"
          defaultValue={task.title}
          className="mb-4 w-full border-none bg-transparent text-xl font-semibold text-slate-900 outline-none dark:text-slate-50"
        />

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
          Description
        </p>
        <textarea
          name="notes"
          defaultValue={task.notes ?? ""}
          placeholder="Add a description…"
          rows={3}
          className="mb-1 w-full resize-none border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-300"
        />

        <button
          type="submit"
          className="mb-5 self-start rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
        >
          Save changes
        </button>
      </form>

      {!task.parent_task_id && (
        <div className="mb-5">
          <div className="flex flex-col gap-1.5">
            {subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <form action={toggleTaskComplete}>
                  <input type="hidden" name="taskId" value={sub.id} />
                  <button
                    type="submit"
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] text-[10px] transition-colors ${
                      sub.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 hover:border-indigo-400 dark:border-slate-600"
                    }`}
                  >
                    {sub.completed ? "✓" : ""}
                  </button>
                </form>
                <span
                  className={`text-sm ${
                    sub.completed
                      ? "text-slate-400 line-through dark:text-slate-600"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {sub.title}
                </span>
              </div>
            ))}
          </div>
          <form action={createSubtask} className="mt-2 flex gap-1">
            <input type="hidden" name="parentTaskId" value={task.id} />
            <input
              name="title"
              placeholder="Add subtask…"
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
            />
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Add
            </button>
          </form>
        </div>
      )}

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
          Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const attached = attachedTagIds.has(tag.id);
            return (
              <form
                key={tag.id}
                action={attached ? detachTagFromTask : attachTagToTask}
              >
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="tagId" value={tag.id} />
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    attached
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {tag.name}
                </button>
              </form>
            );
          })}
        </div>
        <form action={createTag} className="mt-2 flex gap-1">
          <input type="hidden" name="taskId" value={task.id} />
          <input
            name="name"
            placeholder="New tag…"
            className="min-w-0 flex-1 rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          />
          <button
            type="submit"
            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            Add
          </button>
        </form>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        {currentList && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <ListIcon />
            {currentList.name}
          </span>
        )}
        {task.due_date && (
          <span className="text-xs text-slate-400 dark:text-slate-600">
            Due {formatShortDate(task.due_date)}
          </span>
        )}
        <DeleteTaskButton task={task} basePath={basePath} />
      </div>
    </aside>
  );
}
