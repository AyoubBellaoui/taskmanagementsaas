import { EventName } from "@paddle/paddle-node-sdk";
import { paddle } from "@/lib/paddle";
import { createAdminClient } from "@/lib/supabase/admin";
import { captureServerEvent } from "@/lib/posthog-server";
import type { PlanTier } from "@/lib/supabase/types";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature") ?? "";
  // Must read as raw text, never request.json() — signature verification
  // hashes the exact raw body bytes.
  const rawBody = await request.text();

  let event;
  try {
    event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated: {
      const sub = event.data;
      const userId = sub.customData?.user_id as string | undefined;
      if (!userId) break;

      const plan: PlanTier = ACTIVE_STATUSES.has(sub.status) ? "pro" : "free";

      await admin.from("subscriptions").upsert({
        user_id: userId,
        plan,
        status: sub.status,
        paddle_customer_id: sub.customerId,
        paddle_subscription_id: sub.id,
        current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
        cancel_at_period_end: Boolean(sub.scheduledChange),
        updated_at: new Date().toISOString(),
      });

      captureServerEvent(
        userId,
        event.eventType === EventName.SubscriptionCreated
          ? "subscription_activated"
          : "subscription_updated",
      );
      break;
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data;
      const userId = sub.customData?.user_id as string | undefined;
      if (!userId) break;

      await admin
        .from("subscriptions")
        .update({
          plan: "free",
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      captureServerEvent(userId, "subscription_canceled");
      break;
    }

    default:
      break;
  }

  return new Response(null, { status: 200 });
}
