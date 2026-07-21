import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Handles both shapes Supabase's confirmation email can produce:
//
// 1. Stock, un-edited "Confirm signup" template: the link points at
//    Supabase's own hosted verify endpoint, which redirects back here with
//    a PKCE `?code=...` param (since @supabase/ssr defaults to the PKCE
//    flow) — exchanged via exchangeCodeForSession(). No template editing
//    required.
// 2. A custom template pointed directly at this route with
//    `?token_hash=...&type=...` — verified via verifyOtp(). Only relevant
//    if the project's email template is manually edited to use this shape.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  }

  redirect("/login?error=confirmation_failed");
}
