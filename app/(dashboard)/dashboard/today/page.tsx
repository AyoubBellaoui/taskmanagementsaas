import { verifySession } from "@/lib/dal";
import { getTodayTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { TaskBoard } from "@/components/dashboard/task-board";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { task } = await searchParams;

  const [tasks, lists] = await Promise.all([
    getTodayTasks(userId),
    getLists(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <TaskBoard
      title="Today"
      tasks={tasks}
      lists={lists}
      basePath="/dashboard/today"
      selectedTaskId={task}
      defaultListId={defaultListId}
      defaultDueDate={todayISO}
      emptyMessage="Nothing due today. Nice."
    />
  );
}
