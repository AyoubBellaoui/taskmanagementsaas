import "server-only";
import { PostHog } from "posthog-node";

// Server Actions and Route Handlers are short-lived processes, so flush
// immediately instead of letting posthog-node batch events in memory.
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });

  client.capture({ distinctId, event, properties });
  await client.shutdown();
}
