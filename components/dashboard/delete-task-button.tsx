"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteTask, restoreTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import { useToast } from "@/components/dashboard/toast-context";
import type { TaskWithTags } from "@/lib/queries/tasks";

export function DeleteTaskButton({
  task,
  basePath,
}: {
  task: TaskWithTags;
  basePath: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  const handleDelete = () => {
    // Snapshot everything needed to recreate the task. Note: subtasks aren't
    // captured here, so undoing the delete of a parent task with subtasks
    // won't bring those back — an accepted gap given how rarely that
    // combination (delete, then undo, a task that has subtasks) occurs.
    const snapshot = {
      title: task.title,
      notes: task.notes,
      listId: task.list_id,
      dueDate: task.due_date,
      priority: task.priority,
      recurrence: task.recurrence,
      tagIds: task.tags.map((t) => t.id),
    };

    router.push(basePath);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", task.id);
      await deleteTask(formData);
    });

    showToast("Task deleted", {
      actionLabel: "Undo",
      onAction: () => startTransition(() => restoreTask(snapshot)),
    });
  };

  return (
    <button type="button" onClick={handleDelete} className="text-sm text-rose-600 hover:underline">
      Delete
    </button>
  );
}
