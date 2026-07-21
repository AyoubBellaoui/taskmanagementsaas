"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { TagSchema } from "@/lib/validations/tags";

// Used directly as a plain `<form action={createTag}>` (no useActionState),
// so invalid input just silently no-ops rather than returning field errors —
// consistent with createSubtask's inline-form pattern.
export async function createTag(formData: FormData) {
  const { userId } = await verifySession();

  const parsed = TagSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: tag, error } = await supabase
    .from("tags")
    .insert({
      user_id: userId,
      name: parsed.data.name,
      color: parsed.data.color ?? null,
    })
    .select("id")
    .single();

  if (error || !tag) return;

  const attachToTaskId = formData.get("taskId") as string | null;
  if (attachToTaskId) {
    await supabase
      .from("task_tags")
      .insert({ task_id: attachToTaskId, tag_id: tag.id });
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteTag(formData: FormData) {
  const { userId } = await verifySession();
  const id = formData.get("id") as string;

  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", id).eq("user_id", userId);

  revalidatePath("/dashboard", "layout");
}

export async function attachTagToTask(formData: FormData) {
  await verifySession();
  const taskId = formData.get("taskId") as string;
  const tagId = formData.get("tagId") as string;

  const supabase = await createClient();
  await supabase.from("task_tags").insert({ task_id: taskId, tag_id: tagId });

  revalidatePath("/dashboard", "layout");
}

export async function detachTagFromTask(formData: FormData) {
  await verifySession();
  const taskId = formData.get("taskId") as string;
  const tagId = formData.get("tagId") as string;

  const supabase = await createClient();
  await supabase
    .from("task_tags")
    .delete()
    .eq("task_id", taskId)
    .eq("tag_id", tagId);

  revalidatePath("/dashboard", "layout");
}
