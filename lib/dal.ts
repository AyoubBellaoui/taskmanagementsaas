import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PlanTier, SubscriptionStatus } from "@/lib/supabase/types";

// This is the real authorization boundary — called from every page and every
// Server Action. proxy.ts only does an optimistic redirect; this re-verifies
// the session against Supabase Auth on every call (memoized per request via
// React's cache()).
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

export const verifySession = cache(async () => {
  const user = await getUser();
  if (!user) redirect("/login");
  return { userId: user.id, email: user.email! };
});

export const getSubscription = cache(async () => {
  const { userId } = await verifySession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .single();

  return (
    data ?? {
      plan: "free" as PlanTier,
      status: "active" as SubscriptionStatus,
      current_period_end: null,
      cancel_at_period_end: false,
    }
  );
});

export const isProUser = cache(async () => {
  const sub = await getSubscription();
  return sub.plan === "pro" && sub.status === "active";
});
