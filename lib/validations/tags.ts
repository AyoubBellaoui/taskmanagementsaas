import * as z from "zod";

export const TagSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Tag name is required." })
    .max(30, { error: "Tag name is too long." })
    .trim(),
  color: z.string().trim().optional(),
});

export type TagState =
  | {
      errors?: { name?: string[]; color?: string[] };
      message?: string;
    }
  | undefined;
