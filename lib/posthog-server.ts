import "server-only";
import { after } from "next/server";
import { PostHog } from "posthog-node";

// Runs the actual capture+flush in `after()` so the PostHog network round
// trip happens once the response has already been sent — callers must not
// block the user-facing mutation (signup, task create, ...) on analytics.
export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  after(async () => {
    const client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });

    client.capture({ distinctId, event, properties });
    await client.shutdown();
  });
}
