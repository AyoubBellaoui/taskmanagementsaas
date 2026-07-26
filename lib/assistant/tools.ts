import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getTodayTasks, getUpcomingTasks, getAllIncompleteTasks } from "@/lib/queries/tasks";
import { getLists } from "@/lib/queries/lists";
import type { TaskWithTags } from "@/lib/queries/tasks";

export const ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description:
      "List the user's incomplete tasks. Use this before answering any question about what's due, overdue, or in a list — never guess from memory.",
    input_schema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["today", "upcoming", "all"],
          description:
            "'today' = due today or overdue, 'upcoming' = due after today, 'all' = every incomplete task regardless of due date.",
        },
        listName: {
          type: "string",
          description: "Optional: only tasks in the list with this name (case-insensitive).",
        },
      },
      required: ["scope"],
    },
  },
  {
    name: "list_lists",
    description: "List the user's lists (name and id). Use this to find a list before creating a task in it.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "create_task",
    description: "Create a new task for the user.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The task title." },
        listName: {
          type: "string",
          description: "List to add it to, by name. Defaults to the user's default list if omitted or not found.",
        },
        dueDate: {
          type: "string",
          description:
            "Due date as YYYY-MM-DD. Compute this from the current date given in the system prompt for relative terms like 'tomorrow'.",
        },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        recurrence: { type: "string", enum: ["daily", "weekly", "monthly"] },
      },
      required: ["title"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as complete. Requires the task's id — call list_tasks first to find it.",
    input_schema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
      },
      required: ["taskId"],
    },
  },
  {
    name: "delete_task",
    description:
      "Permanently delete a task. Requires the task's id — call list_tasks first to find it and confirm with the user which task they mean if there's any ambiguity.",
    input_schema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
      },
      required: ["taskId"],
    },
  },
];

function summarizeTask(task: TaskWithTags) {
  return {
    id: task.id,
    title: task.title,
    dueDate: task.due_date,
    priority: task.priority,
    list: task.list?.name ?? null,
  };
}

export async function executeAssistantTool(
  userId: string,
  name: string,
  input: Record<string, unknown>,
): Promise<{ result: unknown; mutated: boolean }> {
  switch (name) {
    case "list_tasks": {
      const scope = (input.scope as string) ?? "all";
      const listNameFilter = (input.listName as string | undefined)?.toLowerCase();
      const tasks =
        scope === "today"
          ? await getTodayTasks(userId)
          : scope === "upcoming"
            ? await getUpcomingTasks(userId)
            : await getAllIncompleteTasks(userId);
      const filtered = listNameFilter
        ? tasks.filter((t) => t.list?.name.toLowerCase() === listNameFilter)
        : tasks;
      return { result: filtered.map(summarizeTask), mutated: false };
    }

    case "list_lists": {
      const lists = await getLists(userId);
      return { result: lists.map((l) => ({ id: l.id, name: l.name })), mutated: false };
    }

    case "create_task": {
      const title = (input.title as string)?.trim();
      if (!title) return { result: { error: "title is required" }, mutated: false };

      const lists = await getLists(userId);
      const listNameFilter = (input.listName as string | undefined)?.toLowerCase();
      const list =
        (listNameFilter && lists.find((l) => l.name.toLowerCase() === listNameFilter)) ||
        lists.find((l) => l.is_default) ||
        lists[0];
      if (!list) return { result: { error: "No list available to add the task to." }, mutated: false };

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          list_id: list.id,
          title,
          due_date: (input.dueDate as string) || null,
          priority: (input.priority as string) || "none",
          recurrence: (input.recurrence as string) || "none",
        })
        .select("id")
        .single();
      if (error || !data) return { result: { error: "Could not create the task." }, mutated: false };
      return { result: { id: data.id, title, list: list.name }, mutated: true };
    }

    case "complete_task": {
      const taskId = input.taskId as string;
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", taskId)
        .eq("user_id", userId)
        .select("id, title")
        .single();
      if (error || !data) return { result: { error: "Task not found." }, mutated: false };
      return { result: { id: data.id, title: data.title, completed: true }, mutated: true };
    }

    case "delete_task": {
      const taskId = input.taskId as string;
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId)
        .select("id, title")
        .single();
      if (error || !data) return { result: { error: "Task not found." }, mutated: false };
      return { result: { id: data.id, title: data.title, deleted: true }, mutated: true };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` }, mutated: false };
  }
}
