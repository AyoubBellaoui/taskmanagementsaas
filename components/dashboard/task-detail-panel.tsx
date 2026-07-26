import Link from "next/link";
import {
  updateTask,
  createSubtask,
} from "@/app/(dashboard)/dashboard/tasks/actions";
import { CompleteToggle } from "@/components/dashboard/complete-toggle";
import { createTag } from "@/app/(dashboard)/dashboard/tags/actions";
import { TagToggle } from "@/components/dashboard/tag-toggle";
import { DeleteTaskButton, DeleteTaskIconButton } from "@/components/dashboard/delete-task-button";
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

const TASK_FORM_ID = "task-edit-form";

function ghostFieldClass() {
  return "-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-500 outline-none hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5";
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
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
    <aside className="flex h-full w-96 shrink-0 flex-col border-l border-slate-200 bg-white shadow-xl animate-panel-in dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-end px-5 pt-4">
        <Link
          href={basePath}
          aria-label="Close"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
        >
          <CloseIcon />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <form id={TASK_FORM_ID} action={updateTask}>
          <input type="hidden" name="id" value={task.id} />

          <div className="flex items-start gap-3">
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
              completeClassName="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors border-emerald-500 bg-emerald-500 text-white"
              incompleteClassName="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors border-slate-300 text-transparent hover:border-indigo-400 dark:border-slate-600"
              completeContent={
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <path d="M2.5 7.2l3 3 6-6.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              incompleteContent=""
            />
            <input
              name="title"
              defaultValue={task.title}
              className={`min-w-0 flex-1 border-none bg-transparent text-xl font-semibold text-slate-900 outline-none dark:text-slate-50 ${
                task.completed ? "text-slate-400 line-through dark:text-slate-600" : ""
              }`}
            />
          </div>

          <div className="mb-4 mt-3 flex flex-wrap items-center gap-1 pl-8 text-sm">
            <label className={ghostFieldClass()}>
              <ListIcon />
              <select
                name="listId"
                defaultValue={task.list_id}
                className="max-w-[6.5rem] truncate bg-transparent outline-none"
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={ghostFieldClass()}>
              <CalendarIcon />
              <input
                type="date"
                name="dueDate"
                defaultValue={task.due_date ?? ""}
                className="w-[6rem] bg-transparent outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </label>

            <label className={ghostFieldClass()}>
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
              <label className={ghostFieldClass()}>
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

          <textarea
            name="notes"
            defaultValue={task.notes ?? ""}
            placeholder="Add a description…"
            rows={3}
            className="w-full resize-none border-none bg-transparent pl-8 text-sm text-slate-600 outline-none placeholder:text-slate-400 dark:text-slate-300"
          />
        </form>

        {!task.parent_task_id && (
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              Subtasks{subtasks.length > 0 && ` · ${subtasks.length}`}
            </p>

            <div className="flex flex-col">
              {subtasks.map((sub) => (
                <div key={sub.id} className="group flex items-center gap-2.5 py-1">
                  <CompleteToggle
                    task={{
                      id: sub.id,
                      completed: sub.completed,
                      listId: sub.list_id,
                      title: sub.title,
                      notes: sub.notes,
                      dueDate: sub.due_date,
                      priority: sub.priority,
                      recurrence: sub.recurrence,
                      parentTaskId: sub.parent_task_id,
                      tagIds: sub.tags.map((t) => t.id),
                    }}
                    completeClassName="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] transition-colors border-emerald-500 bg-emerald-500 text-white"
                    incompleteClassName="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] transition-colors border-slate-300 hover:border-indigo-400 dark:border-slate-600"
                    completeContent="✓"
                    incompleteContent=""
                  />
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      sub.completed
                        ? "text-slate-400 line-through dark:text-slate-600"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {sub.title}
                  </span>
                  <DeleteTaskIconButton task={sub} basePath={basePath} />
                </div>
              ))}
            </div>

            <form action={createSubtask} className="mt-1.5 flex items-center gap-1.5">
              <input type="hidden" name="parentTaskId" value={task.id} />
              <span className="text-slate-400 dark:text-slate-600">
                <PlusIcon />
              </span>
              <input
                name="title"
                placeholder="Add subtask"
                className="min-w-0 flex-1 border-none bg-transparent py-1 text-sm text-slate-600 outline-none placeholder:text-slate-400 dark:text-slate-300 dark:placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
              >
                Add
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            Tags
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {allTags.map((tag) => (
              <TagToggle
                key={tag.id}
                taskId={task.id}
                tagId={tag.id}
                tagName={tag.name}
                attached={attachedTagIds.has(tag.id)}
              />
            ))}

            <form action={createTag} className="flex items-center">
              <input type="hidden" name="taskId" value={task.id} />
              <input
                name="name"
                placeholder="Add tag"
                size={8}
                className="min-w-0 border-none bg-transparent px-1 py-1 text-xs text-slate-500 outline-none placeholder:text-slate-400 dark:text-slate-400 dark:placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
          {currentList && <span className="truncate">{currentList.name}</span>}
          {task.due_date && (
            <>
              <span aria-hidden>·</span>
              <span className="shrink-0">Due {formatShortDate(task.due_date)}</span>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <DeleteTaskButton task={task} basePath={basePath} />
          <button
            type="submit"
            form={TASK_FORM_ID}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Save changes
          </button>
        </div>
      </div>
    </aside>
  );
}
