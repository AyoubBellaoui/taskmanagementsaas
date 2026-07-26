"use server";

import { revalidatePath } from "next/cache";
import { addDays, addMonths, addWeeks } from "date-fns";
import { verifySession, isProUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/posthog-server";
import { FREE_PLAN_ACTIVE_TASK_LIMIT } from "@/lib/plan-limits";
import { countActiveTasks } from "@/lib/queries/tasks";
import { TaskSchema, type TaskState } from "@/lib/validations/tasks";
import type { Priority, Recurrence } from "@/lib/supabase/types";

function nextDueDate(dueDate: string, recurrence: Recurrence): string {
  const date = new Date(`${dueDate}T00:00:00`);
  const next =
    recurrence === "daily"
      ? addDays(date, 1)
      : recurrence === "weekly"
        ? addWeeks(date, 1)
        : addMonths(date, 1);
  return next.toISOString().slice(0, 10);
}

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
    recurrence: formData.get("recurrence") || undefined,
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
    recurrence: parsed.data.recurrence ?? "none",
  });
  if (error) return { message: "Could not create task." };

  captureServerEvent(userId, "task_created");
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

  captureServerEvent(userId, "task_created", { is_subtask: true });
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
    recurrence: formData.get("recurrence") || undefined,
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
      recurrence: parsed.data.recurrence ?? "none",
      ...(parsed.data.listId ? { list_id: parsed.data.listId } : {}),
    })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}

// Takes the fields needed for the recurring-spawn branch directly from the
// caller (which already has them — it's the same task object rendered on
// screen) instead of re-SELECTing the row first. That turns the common,
// highest-frequency case (checking a non-recurring task) into a single
// round trip instead of a SELECT-then-UPDATE pair.
export async function toggleTaskComplete(input: {
  id: string;
  completed: boolean;
  listId: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: Priority;
  recurrence: Recurrence;
  parentTaskId: string | null;
  tagIds: string[];
}) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  await supabase
    .from("tasks")
    .update({
      completed: input.completed,
      completed_at: input.completed ? new Date().toISOString() : null,
    })
    .eq("id", input.id)
    .eq("user_id", userId);

  if (input.completed) {
    captureServerEvent(userId, "task_completed");

    // Recurring task: spawn the next occurrence. Skipped for subtasks (they
    // don't have their own recurrence UI) and tasks with no due date (there's
    // nothing to advance). Deliberately not plan-limit-gated — this is a
    // continuation of an existing commitment, not a new task the user chose
    // to add beyond their plan.
    if (input.recurrence !== "none" && input.dueDate && !input.parentTaskId) {
      const { data: nextTask } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          list_id: input.listId,
          title: input.title,
          notes: input.notes,
          due_date: nextDueDate(input.dueDate, input.recurrence),
          priority: input.priority,
          recurrence: input.recurrence,
        })
        .select("id")
        .single();

      if (nextTask && input.tagIds.length > 0) {
        await supabase.from("task_tags").insert(
          input.tagIds.map((tagId) => ({ task_id: nextTask.id, tag_id: tagId })),
        );
      }
    }
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

// Undo for deleteTask: re-creates a task from a client-held snapshot rather
// than un-deleting the row (simplest correct option — deleteTask doesn't
// soft-delete, so there's nothing to restore server-side).
export async function restoreTask(snapshot: {
  title: string;
  notes: string | null;
  listId: string;
  dueDate: string | null;
  priority: string;
  recurrence: string;
  tagIds: string[];
}) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      list_id: snapshot.listId,
      title: snapshot.title,
      notes: snapshot.notes,
      due_date: snapshot.dueDate,
      priority: snapshot.priority,
      recurrence: snapshot.recurrence,
    })
    .select("id")
    .single();

  if (task && snapshot.tagIds.length > 0) {
    await supabase
      .from("task_tags")
      .insert(snapshot.tagIds.map((tagId) => ({ task_id: task.id, tag_id: tagId })));
  }

  revalidatePath("/dashboard", "layout");
}

// Drag-and-drop reordering within a single list: `taskIds` is the full,
// already-reordered list of task ids for that list; each gets its `position`
// set to its index.
export async function reorderTasks(taskIds: string[]) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  await Promise.all(
    taskIds.map((id, index) =>
      supabase.from("tasks").update({ position: index }).eq("id", id).eq("user_id", userId),
    ),
  );

  revalidatePath("/dashboard", "layout");
}

// Bulk actions from multi-select mode. Called directly from client code
// (not bound to a <form>), so they take plain arguments rather than FormData.
export async function bulkCompleteTasks(taskIds: string[]) {
  const { userId } = await verifySession();
  if (taskIds.length === 0) return;

  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .in("id", taskIds)
    .eq("user_id", userId);

  captureServerEvent(userId, "task_completed", { bulk: true, count: taskIds.length });
  revalidatePath("/dashboard", "layout");
}

export async function bulkDeleteTasks(taskIds: string[]) {
  const { userId } = await verifySession();
  if (taskIds.length === 0) return;

  const supabase = await createClient();
  await supabase.from("tasks").delete().in("id", taskIds).eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}

export async function bulkMoveTasks(taskIds: string[], listId: string) {
  const { userId } = await verifySession();
  if (taskIds.length === 0) return;

  const supabase = await createClient();
  await supabase.from("tasks").update({ list_id: listId }).in("id", taskIds).eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}

// Command palette search: lightweight, title-only match, top-level tasks only.
export async function searchTasks(query: string) {
  const { userId } = await verifySession();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, title, list_id, completed")
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .ilike("title", `%${trimmed}%`)
    .order("completed", { ascending: true })
    .limit(8);

  return data ?? [];
}

// Command palette "Create task: ..." fallback — no due date/priority, just a
// title, dropped into the given list (or the default list if none given).
export async function quickCreateTask(title: string, listId?: string) {
  const { userId } = await verifySession();
  const trimmed = title.trim();
  if (!trimmed) return;

  if (!(await isProUser())) {
    const activeCount = await countActiveTasks(userId);
    if (activeCount >= FREE_PLAN_ACTIVE_TASK_LIMIT) return;
  }

  const supabase = await createClient();
  let targetListId = listId;
  if (!targetListId) {
    const { data } = await supabase
      .from("lists")
      .select("id")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single();
    targetListId = data?.id;
  }
  if (!targetListId) return;

  await supabase.from("tasks").insert({ user_id: userId, list_id: targetListId, title: trimmed });
  captureServerEvent(userId, "task_created", { via: "command_palette" });
  revalidatePath("/dashboard", "layout");
}

// Context-menu "Duplicate": copies title/notes/date/priority/recurrence and
// tags. Subtasks aren't copied — treated the same as the delete/undo
// snapshot's scope, to keep this a shallow, predictable copy.
export async function duplicateTask(taskId: string) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: original } = await supabase
    .from("tasks")
    .select("list_id, title, notes, due_date, priority, recurrence")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();
  if (!original) return;

  if (!(await isProUser())) {
    const activeCount = await countActiveTasks(userId);
    if (activeCount >= FREE_PLAN_ACTIVE_TASK_LIMIT) return;
  }

  const { data: copy } = await supabase
    .from("tasks")
    .insert({ ...original, user_id: userId, title: `${original.title} (copy)` })
    .select("id")
    .single();

  if (copy) {
    const { data: tags } = await supabase.from("task_tags").select("tag_id").eq("task_id", taskId);
    if (tags && tags.length > 0) {
      await supabase
        .from("task_tags")
        .insert(tags.map((t) => ({ task_id: copy.id, tag_id: t.tag_id })));
    }
  }

  captureServerEvent(userId, "task_created", { via: "duplicate" });
  revalidatePath("/dashboard", "layout");
}
