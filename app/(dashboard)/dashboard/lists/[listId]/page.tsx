import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getListTasks } from "@/lib/queries/tasks";
import { getListById, getLists } from "@/lib/queries/lists";
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

  const [tasks, lists] = await Promise.all([
    getListTasks(userId, listId),
    getLists(userId),
  ]);

  return (
    <TaskBoard
      title={list.name}
      tasks={tasks}
      lists={lists}
      basePath={`/dashboard/lists/${listId}`}
      selectedTaskId={task}
      defaultListId={listId}
      emptyMessage="This list is empty."
    />
  );
}
