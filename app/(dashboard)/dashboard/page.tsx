import { verifySession } from "@/lib/dal";
import { getAllCompletedTasks, getAllIncompleteTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { getTags } from "@/lib/queries/tags";
import { TaskBoard } from "@/components/dashboard/task-board";
import { TaskDetailPanel } from "@/components/dashboard/task-detail-panel";

export default async function AllTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { task } = await searchParams;

  const [tasks, completedTasks, lists, tags] = await Promise.all([
    getAllIncompleteTasks(userId),
    getAllCompletedTasks(userId),
    getLists(userId),
    getTags(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;

  return (
    <TaskBoard
      title="All tasks"
      tasks={tasks}
      completedTasks={completedTasks}
      lists={lists}
      availableTags={tags}
      basePath="/dashboard"
      detailPanel={task && <TaskDetailPanel taskId={task} basePath="/dashboard" />}
      defaultListId={defaultListId}
      emptyMessage="No tasks yet. Add your first one above."
      grouped
    />
  );
}
