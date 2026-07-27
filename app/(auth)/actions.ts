"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent } from "@/lib/posthog-server";
import {
  LoginSchema,
  SignupSchema,
  type LoginState,
  type SignupState,
} from "@/lib/validations/auth";

// Supabase's raw error.message is written for developers, not end users
// (e.g. "email rate limit exceeded" — no indication of what to actually do).
// Map the codes we can act on to something a user can follow.
function signupErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "over_email_send_rate_limit":
      return "Too many signup attempts in a short time — please wait a few minutes before trying again.";
    case "user_already_exists":
    case "email_exists":
      return "This email is already registered. Try logging in instead.";
    default:
      return error.message;
  }
}

export async function signup(
  _state: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    return { message: signupErrorMessage(error) };
  }

  // Supabase returns a fake "success" with no error and an empty
  // `identities` array when signUp() targets an email that's already
  // registered and confirmed — this is intentional, to stop signup being
  // used to enumerate accounts. No email is actually sent in that case, so
  // saying "check your email" here would be a lie.
  if (data.user && data.user.identities?.length === 0) {
    return { message: "This email is already registered. Try logging in instead." };
  }

  if (data.user) {
    captureServerEvent(data.user.id, "user_signed_up");
  }

  // No redirect here: Supabase requires email confirmation before a
  // session exists (see app/auth/confirm/route.ts).
  return {
    message: "Check your email to confirm your account before signing in.",
    success: true,
  };
}

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
