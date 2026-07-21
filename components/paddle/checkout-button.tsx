"use client";

import { useCallback, useEffect, useState } from "react";
import { initializePaddle, type Paddle, type Environments } from "@paddle/paddle-js";
import posthog from "posthog-js";

export function CheckoutButton({
  priceId,
  userId,
  email,
  className,
}: {
  priceId: string;
  userId?: string;
  email?: string;
  className?: string;
}) {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environments) ?? "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then(setPaddle);
  }, []);

  const onClick = useCallback(() => {
    if (!userId) {
      window.location.href = "/signup?next=/pricing";
      return;
    }

    posthog.capture("checkout_started");

    // customData.user_id is echoed back on every subscription.* webhook
    // event, which is how app/api/webhooks/paddle/route.ts attributes the
    // subscription to this Supabase user with no extra lookup table.
    paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: email ? { email } : undefined,
      customData: { user_id: userId },
      settings: {
        successUrl: `${window.location.origin}/dashboard/account?checkout=success`,
      },
    });
  }, [paddle, priceId, userId, email]);

  return (
    <button onClick={onClick} disabled={!paddle} className={className}>
      {paddle ? "Upgrade to Pro" : "Loading…"}
    </button>
  );
}
