import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getListCompletedTasks, getListTasks } from "@/lib/queries/tasks";
import { getListById, getLists } from "@/lib/queries/lists";
import { getTags } from "@/lib/queries/tags";
import { TaskBoard } from "@/components/dashboard/task-board";

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { userId } = await verifySession();
  const { listId } = await params;
  const { task } = await searchParams;

  const list = await getListById(userId, listId);
  if (!list) notFound();

  const [tasks, completedTasks, lists, tags] = await Promise.all([
    getListTasks(userId, listId),
    getListCompletedTasks(userId, listId),
    getLists(userId),
    getTags(userId),
  ]);

  return (
    <TaskBoard
      title={list.name}
      tasks={tasks}
      completedTasks={completedTasks}
      lists={lists}
      availableTags={tags}
      basePath={`/dashboard/lists/${listId}`}
      selectedTaskId={task}
      defaultListId={listId}
      emptyMessage="This list is empty."
      reorderable
    />
  );
}
