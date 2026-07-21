import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses Row Level Security entirely. Import this
// ONLY from the Paddle webhook route (app/api/webhooks/paddle/route.ts) —
// it is the sole privileged write path for the `subscriptions` table.
// Not parameterized with a generated Database type — see
// lib/supabase/client.ts for why.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
