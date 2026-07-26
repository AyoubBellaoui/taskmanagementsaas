import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type List = Database["public"]["Tables"]["lists"]["Row"];

// cache()'d because the layout (sidebar), the page (task board), and the
// task detail panel each need the list of lists independently — without
// this every one of those calls was a separate Supabase round trip for
// identical data within the same render pass.
export const getLists = cache(async (userId: string): Promise<List[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  return data ?? [];
});

export const getListById = cache(async (
  userId: string,
  listId: string,
): Promise<List | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .eq("id", listId)
    .single();
  return data ?? null;
});

export async function getDefaultListId(userId: string): Promise<string | null> {
  const lists = await getLists(userId);
  return lists.find((l) => l.is_default)?.id ?? lists[0]?.id ?? null;
}
