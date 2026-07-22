import * as z from "zod";

export const PrioritySchema = z.enum(["none", "low", "medium", "high"]);
export const RecurrenceSchema = z.enum(["none", "daily", "weekly", "monthly"]);

export const TaskSchema = z.object({
  title: z
    .string()
    .min(1, { error: "Title is required." })
    .max(200, { error: "Title is too long." })
    .trim(),
  notes: z.string().trim().optional(),
  listId: z.uuid({ error: "Pick a valid list." }),
  dueDate: z.string().trim().optional(),
  priority: PrioritySchema.optional(),
  recurrence: RecurrenceSchema.optional(),
});

export type TaskState =
  | {
      errors?: {
        title?: string[];
        notes?: string[];
        listId?: string[];
        dueDate?: string[];
        priority?: string[];
        recurrence?: string[];
      };
      message?: string;
    }
  | undefined;
