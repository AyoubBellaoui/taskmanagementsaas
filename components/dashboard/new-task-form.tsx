"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { List } from "@/lib/queries/lists";

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
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

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
      className="mb-4 flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-800"
    >
      <input
        ref={titleRef}
        name="title"
        placeholder="Add a task…"
        className="border-none bg-transparent text-sm outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="listId"
          defaultValue={defaultListId}
          className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs dark:border-zinc-800"
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
          className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs dark:border-zinc-800"
        />
        <select
          name="priority"
          defaultValue="none"
          className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs dark:border-zinc-800"
        >
          <option value="none">No priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Adding…" : "Add task"}
        </button>
      </div>
      {(state?.errors?.title || state?.message) && (
        <p className="text-xs text-red-600">
          {state?.errors?.title?.[0] ?? state?.message}
        </p>
      )}
    </form>
  );
}
