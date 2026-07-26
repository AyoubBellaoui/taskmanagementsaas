import { verifySession } from "@/lib/dal";
import { getTodayCompletedTasks, getTodayTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { getTags } from "@/lib/queries/tags";
import { TaskBoard } from "@/components/dashboard/task-board";
import { TaskDetailPanel } from "@/components/dashboard/task-detail-panel";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { task } = await searchParams;

  const [tasks, completedTasks, lists, tags] = await Promise.all([
    getTodayTasks(userId),
    getTodayCompletedTasks(userId),
    getLists(userId),
    getTags(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <TaskBoard
      title="Today"
      tasks={tasks}
      completedTasks={completedTasks}
      lists={lists}
      availableTags={tags}
      basePath="/dashboard/today"
      detailPanel={task && <TaskDetailPanel taskId={task} basePath="/dashboard/today" />}
      defaultListId={defaultListId}
      defaultDueDate={todayISO}
      emptyMessage="Nothing due today. Nice."
    />
  );
}
