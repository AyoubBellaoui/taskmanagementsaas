"use server";

import { revalidatePath } from "next/cache";
import { verifySession, isProUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/posthog-server";
import { FREE_PLAN_ACTIVE_TASK_LIMIT } from "@/lib/plan-limits";
import { countActiveTasks } from "@/lib/queries/tasks";
import { TaskSchema, type TaskState } from "@/lib/validations/tasks";

export async function createTask(
  _state: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const { userId } = await verifySession();

  const parsed = TaskSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    listId: formData.get("listId"),
    dueDate: formData.get("dueDate") || undefined,
    priority: formData.get("priority") || undefined,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await isProUser())) {
    const activeCount = await countActiveTasks(userId);
    if (activeCount >= FREE_PLAN_ACTIVE_TASK_LIMIT) {
      return {
        message: `Free plan is limited to ${FREE_PLAN_ACTIVE_TASK_LIMIT} active tasks. Upgrade to Pro for unlimited tasks.`,
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    list_id: parsed.data.listId,
    title: parsed.data.title,
    notes: parsed.data.notes ?? null,
    due_date: parsed.data.dueDate ?? null,
    priority: parsed.data.priority ?? "none",
  });
  if (error) return { message: "Could not create task." };

  await captureServerEvent(userId, "task_created");
  revalidatePath("/dashboard", "layout");
}

export async function createSubtask(formData: FormData) {
  const { userId } = await verifySession();
  const parentTaskId = formData.get("parentTaskId") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  const supabase = await createClient();

  const { data: parent } = await supabase
    .from("tasks")
    .select("id, list_id, parent_task_id")
    .eq("id", parentTaskId)
    .eq("user_id", userId)
    .single();
  if (!parent) return;

  // Only one level of nesting: reject subtasks-of-subtasks.
  if (parent.parent_task_id) return;

  if (!(await isProUser())) {
    const activeCount = await countActiveTasks(userId);
    if (activeCount >= FREE_PLAN_ACTIVE_TASK_LIMIT) return;
  }

  await supabase.from("tasks").insert({
    user_id: userId,
    list_id: parent.list_id,
    parent_task_id: parent.id,
    title,
  });

  await captureServerEvent(userId, "task_created", { is_subtask: true });
  revalidatePath("/dashboard", "layout");
}

export async function updateTask(formData: FormData) {
  const { userId } = await verifySession();
  const id = formData.get("id") as string;

  const parsed = TaskSchema.partial({ listId: true }).safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    listId: formData.get("listId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    priority: formData.get("priority") || undefined,
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      notes: parsed.data.notes ?? null,
      due_date: parsed.data.dueDate ?? null,
      priority: parsed.data.priority ?? "none",
      ...(parsed.data.listId ? { list_id: parsed.data.listId } : {}),
    })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}

export async function toggleTaskComplete(formData: FormData) {
  const { userId } = await verifySession();
  const taskId = formData.get("taskId") as string;

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("completed")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();
  if (!task) return;

  const nextCompleted = !task.completed;

  await supabase
    .from("tasks")
    .update({
      completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (nextCompleted) {
    await captureServerEvent(userId, "task_completed");
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteTask(formData: FormData) {
  const { userId } = await verifySession();
  const id = formData.get("id") as string;

  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}
