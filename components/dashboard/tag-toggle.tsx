"use client";

import { useOptimistic, useTransition } from "react";
import { attachTagToTask, detachTagFromTask } from "@/app/(dashboard)/dashboard/tags/actions";

// Flips the pill's own color the instant you click it instead of waiting on
// the attach/detach round trip — the plain <form action={...}> it replaces
// gave no feedback until the server responded.
export function TagToggle({
  taskId,
  tagId,
  tagName,
  attached,
}: {
  taskId: string;
  tagId: string;
  tagName: string;
  attached: boolean;
}) {
  const [optimisticAttached, setOptimisticAttached] = useOptimistic(attached);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={optimisticAttached ? `Remove tag "${tagName}"` : `Add tag "${tagName}"`}
      onClick={() => {
        const next = !optimisticAttached;
        const formData = new FormData();
        formData.set("taskId", taskId);
        formData.set("tagId", tagId);
        startTransition(async () => {
          setOptimisticAttached(next);
          await (next ? attachTagToTask(formData) : detachTagFromTask(formData));
        });
      }}
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors ${
        optimisticAttached
          ? "bg-indigo-600 text-white hover:bg-indigo-500"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      }`}
    >
      {tagName}
      {optimisticAttached && <span className="text-indigo-200">×</span>}
    </button>
  );
}
