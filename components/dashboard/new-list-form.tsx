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
    <form ref={formRef} action={action} className="flex flex-col gap-1 px-1 pt-1">
      <div className="flex gap-1">
        <input
          name="name"
          placeholder="New list…"
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 dark:text-slate-300 dark:focus:border-slate-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-2.5 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-slate-300"
        >
          +
        </button>
      </div>
      {(state?.errors?.name || state?.message) && (
        <p className="px-3 text-xs text-rose-600">
          {state?.errors?.name?.[0] ?? state?.message}
        </p>
      )}
    </form>
  );
}
