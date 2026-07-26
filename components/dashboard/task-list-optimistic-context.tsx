"use client";

import { createContext, useContext } from "react";

// Lets deeply-nested components (the delete button inside TaskItem, several
// levels below TaskBoard) optimistically remove a task from TaskBoard's
// list the instant it's deleted, without prop-drilling a callback through
// every intermediate layer. Optional: components outside a TaskBoard (none
// currently) just skip the optimistic removal and fall back to revalidation.
export const TaskListOptimisticContext = createContext<{
  removeTask: (id: string) => void;
} | null>(null);

export function useTaskListOptimisticRemove() {
  return useContext(TaskListOptimisticContext)?.removeTask;
}
