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
    return <p className="px-2 py-6 text-sm text-slate-400 dark:text-slate-600">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} basePath={basePath} />
      ))}
    </div>
  );
}
