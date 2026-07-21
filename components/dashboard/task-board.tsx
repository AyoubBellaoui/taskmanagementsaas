import { NewTaskForm } from "@/components/dashboard/new-task-form";
import { TaskList } from "@/components/dashboard/task-list";
import { TaskDetailPanel } from "@/components/dashboard/task-detail-panel";
import type { TaskWithTags } from "@/lib/queries/tasks";
import type { List } from "@/lib/queries/lists";

function groupByList(tasks: TaskWithTags[]) {
  const groups = new Map<string, { list: TaskWithTags["list"]; tasks: TaskWithTags[] }>();
  for (const task of tasks) {
    const key = task.list?.id ?? "none";
    if (!groups.has(key)) groups.set(key, { list: task.list, tasks: [] });
    groups.get(key)!.tasks.push(task);
  }
  return Array.from(groups.values());
}

export function TaskBoard({
  title,
  tasks,
  lists,
  basePath,
  selectedTaskId,
  emptyMessage = "Nothing here. Enjoy the quiet.",
  defaultListId,
  defaultDueDate,
  grouped = false,
}: {
  title: string;
  tasks: TaskWithTags[];
  lists: List[];
  basePath: string;
  selectedTaskId?: string;
  emptyMessage?: string;
  defaultListId?: string;
  defaultDueDate?: string;
  grouped?: boolean;
}) {
  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>

        <NewTaskForm
          lists={lists}
          defaultListId={defaultListId}
          defaultDueDate={defaultDueDate}
        />

        {tasks.length === 0 ? (
          <p className="px-2 py-6 text-sm text-zinc-400">{emptyMessage}</p>
        ) : grouped ? (
          <div className="flex flex-col gap-6">
            {groupByList(tasks).map((group) => (
              <div key={group.list?.id ?? "none"}>
                <h2 className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {group.list?.name ?? "No list"}
                </h2>
                <TaskList tasks={group.tasks} basePath={basePath} />
              </div>
            ))}
          </div>
        ) : (
          <TaskList tasks={tasks} basePath={basePath} emptyMessage={emptyMessage} />
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} basePath={basePath} />
      )}
    </div>
  );
}
