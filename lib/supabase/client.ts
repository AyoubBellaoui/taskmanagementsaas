import { createBrowserClient } from "@supabase/ssr";

// Not parameterized with a generated Database type: there's no live
// Supabase project to generate one from yet. Once the student has a real
// project, run `npx supabase gen types typescript --project-id <ref>` and
// pass the result as the generic here for full query type-safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
