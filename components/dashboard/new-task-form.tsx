"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { List } from "@/lib/queries/lists";

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

export function NewTaskForm({
  lists,
  defaultListId,
  defaultDueDate,
}: {
  lists: List[];
  defaultListId?: string;
  defaultDueDate?: string;
}) {
  const [state, action, pending] = useActionState(createTask, undefined);
  const [expanded, setExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Collapse back to the compact bar the moment a submission finishes
  // successfully. Tracking the previous `pending` value in state (not a
  // ref) and updating during render — rather than inside an effect — is
  // React's documented pattern for reacting to a value change without an
  // extra effect-triggered render.
  const [prevPending, setPrevPending] = useState(pending);
  if (prevPending !== pending) {
    setPrevPending(pending);
    if (prevPending && !state?.errors && !state?.message) {
      setExpanded(false);
    }
  }

  // DOM-only cleanup — a real effect, but one that never calls setState.
  useEffect(() => {
    if (!pending && !state?.errors && !state?.message) {
      formRef.current?.reset();
      titleRef.current?.focus();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={action}
      className={`mb-5 rounded-xl border transition-colors ${
        expanded
          ? "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          : "border-slate-200 bg-transparent hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <span className="text-slate-400 dark:text-slate-600">
          <PlusIcon />
        </span>
        <input
          ref={titleRef}
          name="title"
          placeholder="Add a task…"
          onFocus={() => setExpanded(true)}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-600"
        />
      </div>

      {expanded && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
          <select
            name="listId"
            defaultValue={defaultListId}
            className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="dueDate"
            defaultValue={defaultDueDate}
            className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          />
          <select
            name="priority"
            defaultValue="none"
            className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            <option value="none">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            name="recurrence"
            defaultValue="none"
            title="Repeat"
            className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            <option value="none">Doesn&apos;t repeat</option>
            <option value="daily">Repeats daily</option>
            <option value="weekly">Repeats weekly</option>
            <option value="monthly">Repeats monthly</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                formRef.current?.reset();
                setExpanded(false);
              }}
              className="rounded-md px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add task"}
            </button>
          </div>
        </div>
      )}

      {(state?.errors?.title || state?.message) && (
        <p className="border-t border-slate-100 px-3.5 py-2 text-xs text-rose-600 dark:border-slate-800">
          {state?.errors?.title?.[0] ?? state?.message}
        </p>
      )}
    </form>
  );
}
