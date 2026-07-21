import { verifySession } from "@/lib/dal";
import { getAllIncompleteTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { TaskBoard } from "@/components/dashboard/task-board";

export default async function AllTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { task } = await searchParams;

  const [tasks, lists] = await Promise.all([
    getAllIncompleteTasks(userId),
    getLists(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;

  return (
    <TaskBoard
      title="All tasks"
      tasks={tasks}
      lists={lists}
      basePath="/dashboard"
      selectedTaskId={task}
      defaultListId={defaultListId}
      emptyMessage="No tasks yet. Add your first one above."
      grouped
    />
  );
}
