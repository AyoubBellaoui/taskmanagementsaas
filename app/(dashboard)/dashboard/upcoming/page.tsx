import { verifySession } from "@/lib/dal";
import { getUpcomingTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { TaskBoard } from "@/components/dashboard/task-board";

export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { task } = await searchParams;

  const [tasks, lists] = await Promise.all([
    getUpcomingTasks(userId),
    getLists(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;

  return (
    <TaskBoard
      title="Upcoming"
      tasks={tasks}
      lists={lists}
      basePath="/dashboard/upcoming"
      selectedTaskId={task}
      defaultListId={defaultListId}
      emptyMessage="Nothing scheduled ahead."
    />
  );
}
