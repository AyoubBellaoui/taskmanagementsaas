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

type Scope = { listId?: string; dueBefore?: string; dueAfterExclusive?: string };

// Shared fetch behind every smart view: incomplete tasks sort soonest-due
// first (undated tasks last); completed tasks sort most-recently-finished
// first. Scoping (list/date range) is layered on top per view.
async function queryTasks(
  userId: string,
  completed: boolean,
  scope: Scope = {},
): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .eq("completed", completed);

  if (scope.listId) query = query.eq("list_id", scope.listId);
  if (scope.dueBefore) query = query.lte("due_date", scope.dueBefore);
  if (scope.dueAfterExclusive) query = query.gt("due_date", scope.dueAfterExclusive);

  const { data } = completed
    ? await query.order("completed_at", { ascending: false }).limit(50)
    : await query.order("due_date", { ascending: true });

  return ((data ?? []) as unknown as RawTaskRow[]).map(normalize);
}

// "Today" = due today or overdue. Compares against the database server's
// date, not the visitor's local timezone — acceptable simplification here.
export const getTodayTasks = (userId: string) =>
  queryTasks(userId, false, { dueBefore: todayISODate() });
export const getTodayCompletedTasks = (userId: string) =>
  queryTasks(userId, true, { dueBefore: todayISODate() });

export const getUpcomingTasks = (userId: string) =>
  queryTasks(userId, false, { dueAfterExclusive: todayISODate() });
export const getUpcomingCompletedTasks = (userId: string) =>
  queryTasks(userId, true, { dueAfterExclusive: todayISODate() });

// "All" / inbox view: every task across all lists, no date filter.
export const getAllIncompleteTasks = (userId: string) => queryTasks(userId, false);
export const getAllCompletedTasks = (userId: string) => queryTasks(userId, true);

export const getListTasks = (userId: string, listId: string) =>
  queryTasks(userId, false, { listId });
export const getListCompletedTasks = (userId: string, listId: string) =>
  queryTasks(userId, true, { listId });

// Calendar view: every task (complete or not) due within a date range.
export async function getTasksInRange(
  userId: string,
  startISO: string,
  endISO: string,
): Promise<TaskWithTags[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .gte("due_date", startISO)
    .lte("due_date", endISO)
    .order("due_date", { ascending: true });
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

// Sidebar nav badge counts (incomplete, top-level tasks per smart view).
export async function getViewCounts(
  userId: string,
): Promise<{ all: number; today: number; upcoming: number }> {
  const supabase = await createClient();
  const today = todayISODate();
  const base = () =>
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("parent_task_id", null)
      .eq("completed", false);

  const [{ count: all }, { count: todayCount }, { count: upcoming }] = await Promise.all([
    base(),
    base().lte("due_date", today),
    base().gt("due_date", today),
  ]);

  return { all: all ?? 0, today: todayCount ?? 0, upcoming: upcoming ?? 0 };
}

// Sidebar per-list incomplete task counts.
export async function getListTaskCounts(
  userId: string,
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("list_id")
    .eq("user_id", userId)
    .is("parent_task_id", null)
    .eq("completed", false);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.list_id] = (counts[row.list_id] ?? 0) + 1;
  }
  return counts;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
};
