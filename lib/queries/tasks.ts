import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database, Priority } from "@/lib/supabase/types";

export type Tag = { id: string; name: string; color: string | null };

export type TaskWithTags = Database["public"]["Tables"]["tasks"]["Row"] & {
  tags: Tag[];
  list: { id: string; name: string; color: string | null } | null;
};

const TASK_SELECT =
  "*, task_tags ( tag:tags ( id, name, color ) ), list:lists ( id, name, color )";

type RawTaskRow = Database["public"]["Tables"]["tasks"]["Row"] & {
  task_tags: { tag: Tag | null }[] | null;
  list: { id: string; name: string; color: string | null } | null;
};

function normalize(row: RawTaskRow): TaskWithTags {
  const { task_tags, ...rest } = row;
  return {
    ...rest,
    tags: (task_tags ?? []).map((t) => t.tag).filter((t): t is Tag => !!t),
  };
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

// "Today" = due today or overdue, not completed. Compares against the
// database server's date, not the visitor's local timezone — acceptable
// simplification for this app's scope.
export async function getTodayTasks(userId: string): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .eq("completed", false)
    .lte("due_date", todayISODate())
    .order("due_date", { ascending: true });
  return ((data ?? []) as unknown as RawTaskRow[]).map(normalize);
}

export async function getUpcomingTasks(userId: string): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .eq("completed", false)
    .gt("due_date", todayISODate())
    .order("due_date", { ascending: true });
  return ((data ?? []) as unknown as RawTaskRow[]).map(normalize);
}

// "All" / inbox view: every incomplete top-level task across all lists.
export async function getAllIncompleteTasks(
  userId: string,
): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .eq("completed", false)
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as RawTaskRow[]).map(normalize);
}

export async function getListTasks(
  userId: string,
  listId: string,
): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .eq("list_id", listId)
    .is("parent_task_id", null)
    .order("completed", { ascending: true })
    .order("position", { ascending: true });
  return ((data ?? []) as unknown as RawTaskRow[]).map(normalize);
}

export async function getTaskById(
  userId: string,
  taskId: string,
): Promise<TaskWithTags | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .eq("id", taskId)
    .single();
  return data ? normalize(data as unknown as RawTaskRow) : null;
}

export async function getSubtasks(
  userId: string,
  parentTaskId: string,
): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .eq("parent_task_id", parentTaskId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as unknown as RawTaskRow[]).map(normalize);
}

export async function countActiveTasks(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", false);
  return count ?? 0;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
};
