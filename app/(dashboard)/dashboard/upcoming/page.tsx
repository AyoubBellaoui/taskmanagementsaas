import { verifySession } from "@/lib/dal";
import { getUpcomingCompletedTasks, getUpcomingTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import { getTags } from "@/lib/queries/tags";
import { TaskBoard } from "@/components/dashboard/task-board";

export default async function UpcomingPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { task } = await searchParams;

  const [tasks, completedTasks, lists, tags] = await Promise.all([
    getUpcomingTasks(userId),
    getUpcomingCompletedTasks(userId),
    getLists(userId),
    getTags(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;

  return (
    <TaskBoard
      title="Upcoming"
      tasks={tasks}
      completedTasks={completedTasks}
      lists={lists}
      availableTags={tags}
      basePath="/dashboard/upcoming"
      selectedTaskId={task}
      defaultListId={defaultListId}
      emptyMessage="Nothing scheduled ahead."
    />
  );
}
