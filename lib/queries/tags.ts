import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];

export async function getTags(userId: string): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  return data ?? [];
}
