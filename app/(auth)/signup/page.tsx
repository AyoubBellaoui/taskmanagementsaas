"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/(auth)/actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Start organizing your tasks in minutes.
        </p>
      </div>

      {state?.message && !state?.errors && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {state.message}
        </p>
      )}

      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Ada Lovelace"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {state?.errors?.password && (
            <ul className="text-xs text-red-600">
              {state.errors.password.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50">
          Log in
        </Link>
      </p>
    </div>
  );
}
