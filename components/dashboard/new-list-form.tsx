"use client";

import { useActionState, useEffect, useRef } from "react";
import { createList } from "@/app/(dashboard)/dashboard/lists/actions";

export function NewListForm() {
  const [state, action, pending] = useActionState(createList, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.errors && !state?.message) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-1 px-2">
      <div className="flex gap-1">
        <input
          name="name"
          placeholder="New list…"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-zinc-300 dark:focus:border-zinc-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md px-2 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-900"
        >
          +
        </button>
      </div>
      {(state?.errors?.name || state?.message) && (
        <p className="px-2 text-xs text-red-600">
          {state?.errors?.name?.[0] ?? state?.message}
        </p>
      )}
    </form>
  );
}
