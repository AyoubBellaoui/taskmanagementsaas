import Link from "next/link";
import {
  deleteTask,
  toggleTaskComplete,
  updateTask,
  createSubtask,
} from "@/app/(dashboard)/dashboard/tasks/actions";
import {
  attachTagToTask,
  createTag,
  detachTagFromTask,
} from "@/app/(dashboard)/dashboard/tags/actions";
import { ConfirmSubmitButton } from "@/components/dashboard/confirm-submit-button";
import { getSubtasks, getTaskById } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { getTags } from "@/lib/queries/tags";
import { verifySession } from "@/lib/dal";

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
      <aside className="flex h-full w-96 shrink-0 flex-col border-l border-zinc-200 p-6 dark:border-zinc-900">
        <p className="text-sm text-zinc-400">Task not found.</p>
        <Link href={basePath} className="mt-2 text-sm underline">
          Close
        </Link>
      </aside>
    );
  }

  const subtasks = task.parent_task_id ? [] : await getSubtasks(userId, task.id);
  const attachedTagIds = new Set(task.tags.map((t) => t.id));

  return (
    <aside className="flex h-full w-96 shrink-0 flex-col overflow-y-auto border-l border-zinc-200 p-6 dark:border-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <form action={toggleTaskComplete}>
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              task.completed
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700"
            }`}
          >
            {task.completed ? "Completed" : "Mark complete"}
          </button>
        </form>
        <Link href={basePath} className="text-sm text-zinc-400 hover:text-zinc-700">
          Close ✕
        </Link>
      </div>

      <form action={updateTask} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={task.id} />

        <input
          name="title"
          defaultValue={task.title}
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
        />

        <textarea
          name="notes"
          defaultValue={task.notes ?? ""}
          placeholder="Notes"
          rows={3}
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">List</label>
          <select
            name="listId"
            defaultValue={task.list_id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">Due date</label>
            <input
              type="date"
              name="dueDate"
              defaultValue={task.due_date ?? ""}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">Priority</label>
            <select
              name="priority"
              defaultValue={task.priority}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          Save changes
        </button>
      </form>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
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
                  className={`rounded-full px-3 py-1 text-xs ${
                    attached
                      ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
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
            className="min-w-0 flex-1 rounded-md border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800"
          >
            Add
          </button>
        </form>
      </div>

      {!task.parent_task_id && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Subtasks
          </p>
          <div className="flex flex-col gap-1">
            {subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <form action={toggleTaskComplete}>
                  <input type="hidden" name="taskId" value={sub.id} />
                  <button
                    type="submit"
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 text-[10px] ${
                      sub.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {sub.completed ? "✓" : ""}
                  </button>
                </form>
                <span
                  className={`text-sm ${
                    sub.completed ? "text-zinc-400 line-through" : "text-zinc-700 dark:text-zinc-300"
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
              className="min-w-0 flex-1 rounded-md border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-md border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800"
            >
              Add
            </button>
          </form>
        </div>
      )}

      <form action={deleteTask} className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-900">
        <input type="hidden" name="id" value={task.id} />
        <ConfirmSubmitButton
          confirmText="Delete this task? This can't be undone."
          className="text-sm text-red-600 hover:underline"
        >
          Delete task
        </ConfirmSubmitButton>
      </form>
    </aside>
  );
}
