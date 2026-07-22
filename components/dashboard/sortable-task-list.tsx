"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableTaskRow } from "@/components/dashboard/sortable-task-row";
import { reorderTasks } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { TaskWithTags } from "@/lib/queries/tasks";

export function SortableTaskList({
  tasks,
  basePath,
}: {
  tasks: TaskWithTags[];
  basePath: string;
}) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const [items, setItems] = useState(() => tasks.map((t) => t.id));
  const [, startTransition] = useTransition();

  // Re-sync local order whenever the server-provided task list changes
  // (e.g. after adding/deleting a task elsewhere). Comparing the previous
  // prop reference and updating during render — not inside an effect —
  // is the pattern this project's stricter React Compiler lint rules
  // require for "reset derived state when a prop changes".
  const [prevTasks, setPrevTasks] = useState(tasks);
  if (prevTasks !== tasks) {
    setPrevTasks(tasks);
    setItems(tasks.map((t) => t.id));
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const next = arrayMove(prev, oldIndex, newIndex);
      startTransition(() => {
        reorderTasks(next);
      });
      return next;
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-0.5">
          {items.map((id) => {
            const task = byId.get(id);
            return task ? <SortableTaskRow key={id} task={task} basePath={basePath} /> : null;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
