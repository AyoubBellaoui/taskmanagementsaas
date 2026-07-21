import * as z from "zod";

export const ListSchema = z.object({
  name: z
    .string()
    .min(1, { error: "List name is required." })
    .max(60, { error: "List name is too long." })
    .trim(),
  color: z.string().trim().optional(),
});

export type ListState =
  | {
      errors?: { name?: string[]; color?: string[] };
      message?: string;
    }
  | undefined;
