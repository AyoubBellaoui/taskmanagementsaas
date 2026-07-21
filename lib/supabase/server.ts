import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// `cookies()` is async in this Next.js fork, so this factory is async too —
// every caller must `await createClient()`. Not parameterized with a
// generated Database type — see lib/supabase/client.ts for why.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, where cookies can't be
            // set. Harmless as long as proxy.ts refreshes the session on
            // every request (see lib/supabase/middleware.ts).
          }
        },
      },
    },
  );
}
