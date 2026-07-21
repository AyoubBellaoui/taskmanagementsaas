"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession, isProUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/posthog-server";
import { FREE_PLAN_LIST_LIMIT } from "@/lib/plan-limits";
import { ListSchema, type ListState } from "@/lib/validations/lists";

export async function createList(
  _state: ListState,
  formData: FormData,
): Promise<ListState> {
  const { userId } = await verifySession();

  const parsed = ListSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  if (!(await isProUser())) {
    const { count } = await supabase
      .from("lists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= FREE_PLAN_LIST_LIMIT) {
      return {
        message: `Free plan is limited to ${FREE_PLAN_LIST_LIMIT} lists. Upgrade to Pro for unlimited lists.`,
      };
    }
  }

  const { error } = await supabase.from("lists").insert({
    user_id: userId,
    name: parsed.data.name,
    color: parsed.data.color ?? null,
  });
  if (error) return { message: "Could not create list." };

  await captureServerEvent(userId, "list_created");
  revalidatePath("/dashboard", "layout");
}

export async function updateList(formData: FormData) {
  const { userId } = await verifySession();
  const id = formData.get("id") as string;

  const parsed = ListSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("lists")
    .update({ name: parsed.data.name, color: parsed.data.color ?? null })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}

export async function deleteList(formData: FormData) {
  const { userId } = await verifySession();
  const id = formData.get("id") as string;

  const supabase = await createClient();
  const { data: list } = await supabase
    .from("lists")
    .select("is_default")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (list?.is_default) {
    // The default Inbox list can't be deleted — every user needs at least
    // one list to hold tasks.
    return;
  }

  await supabase.from("lists").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
