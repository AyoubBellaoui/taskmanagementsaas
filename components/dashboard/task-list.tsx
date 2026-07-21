import { TaskItem } from "@/components/dashboard/task-item";
import type { TaskWithTags } from "@/lib/queries/tasks";

export function TaskList({
  tasks,
  basePath,
  emptyMessage = "Nothing here.",
}: {
  tasks: TaskWithTags[];
  basePath: string;
  emptyMessage?: string;
}) {
  if (tasks.length === 0) {
    return <p className="px-2 py-6 text-sm text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} basePath={basePath} />
      ))}
    </div>
  );
}
