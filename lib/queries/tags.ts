import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];

// cache()'d — the page and the task detail panel each fetch the full tag
// list independently within the same render pass; see lists.ts for why.
export const getTags = cache(async (userId: string): Promise<Tag[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  return data ?? [];
});
