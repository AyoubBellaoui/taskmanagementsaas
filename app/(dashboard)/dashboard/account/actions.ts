"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { paddle } from "@/lib/paddle";

export async function openBillingPortal() {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("paddle_customer_id, paddle_subscription_id")
    .eq("user_id", userId)
    .single();

  if (!data?.paddle_customer_id) {
    redirect("/pricing");
  }

  const portalSession = await paddle.customerPortalSessions.create(
    data.paddle_customer_id,
    data.paddle_subscription_id ? [data.paddle_subscription_id] : [],
  );

  redirect(portalSession.urls.general.overview);
}
