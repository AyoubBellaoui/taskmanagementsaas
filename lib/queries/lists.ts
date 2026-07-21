import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type List = Database["public"]["Tables"]["lists"]["Row"];

export async function getLists(userId: string): Promise<List[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getListById(
  userId: string,
  listId: string,
): Promise<List | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .eq("id", listId)
    .single();
  return data ?? null;
}

export async function getDefaultListId(userId: string): Promise<string | null> {
  const lists = await getLists(userId);
  return lists.find((l) => l.is_default)?.id ?? lists[0]?.id ?? null;
}
