"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "@/components/dashboard/task-item";
import type { TaskWithTags } from "@/lib/queries/tasks";

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
      <circle cx="5" cy="4" r="1.1" />
      <circle cx="11" cy="4" r="1.1" />
      <circle cx="5" cy="8" r="1.1" />
      <circle cx="11" cy="8" r="1.1" />
      <circle cx="5" cy="12" r="1.1" />
      <circle cx="11" cy="12" r="1.1" />
    </svg>
  );
}

export function SortableTaskRow({
  task,
  basePath,
}: {
  task: TaskWithTags;
  basePath: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="shrink-0 cursor-grab touch-none px-1 text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-700 dark:hover:text-slate-500"
      >
        <DragHandleIcon />
      </button>
      <div className="min-w-0 flex-1">
        <TaskItem task={task} basePath={basePath} />
      </div>
    </div>
  );
}
