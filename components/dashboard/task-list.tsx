import { TaskRow } from "@/components/dashboard/task-row";
import type { TaskWithTags } from "@/lib/queries/tasks";
import type { List } from "@/lib/queries/lists";

export function TaskList({
  tasks,
  basePath,
  lists = [],
  emptyMessage = "Nothing here.",
}: {
  tasks: TaskWithTags[];
  basePath: string;
  lists?: List[];
  emptyMessage?: string;
}) {
  if (tasks.length === 0) {
    return <p className="px-2 py-6 text-sm text-slate-400 dark:text-slate-600">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} basePath={basePath} lists={lists} />
      ))}
    </div>
  );
}
