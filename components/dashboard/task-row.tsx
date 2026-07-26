"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaskItem } from "@/components/dashboard/task-item";
import { useDeleteTaskWithUndo } from "@/components/dashboard/delete-task-button";
import { useToast } from "@/components/dashboard/toast-context";
import { duplicateTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import { bulkMoveTasks } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { TaskWithTags } from "@/lib/queries/tasks";
import type { List } from "@/lib/queries/lists";

const MENU_WIDTH = 176;

function menuItemClass(danger = false) {
  return `flex w-full items-center px-3 py-1.5 text-left text-sm ${
    danger
      ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
  }`;
}

export function TaskRow({
  task,
  basePath,
  lists,
  dragHandle,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: {
  task: TaskWithTags;
  basePath: string;
  lists: List[];
  dragHandle?: React.ReactNode;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const deleteWithUndo = useDeleteTaskWithUndo();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!menuPos) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuPos(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuPos(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuPos]);

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - MENU_WIDTH - 8);
    const y = Math.min(e.clientY, window.innerHeight - 180);
    setMenuPos({ x, y });
  };

  return (
    <div onContextMenu={openMenu} className="relative">
      <TaskItem
        task={task}
        basePath={basePath}
        dragHandle={dragHandle}
        selectMode={selectMode}
        selected={selected}
        onToggleSelect={onToggleSelect}
      />

      {menuPos && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menuPos.y, left: menuPos.x, width: MENU_WIDTH }}
          className="z-50 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            className={menuItemClass()}
            onClick={() => {
              setMenuPos(null);
              router.push(`${basePath}?task=${task.id}`);
            }}
          >
            Open
          </button>
          <button
            type="button"
            className={menuItemClass()}
            onClick={() => {
              setMenuPos(null);
              startTransition(async () => {
                await duplicateTask(task.id);
                showToast("Task duplicated");
              });
            }}
          >
            Duplicate
          </button>
          {lists.length > 1 && (
            <label className={`${menuItemClass()} cursor-pointer justify-between`}>
              Move to
              <select
                value=""
                onChange={(e) => {
                  const listId = e.target.value;
                  if (!listId) return;
                  const listName = lists.find((l) => l.id === listId)?.name ?? "list";
                  setMenuPos(null);
                  startTransition(async () => {
                    await bulkMoveTasks([task.id], listId);
                    showToast(`Moved to ${listName}`);
                  });
                }}
                className="ml-2 max-w-[5.5rem] truncate bg-transparent text-xs text-slate-400 outline-none"
              >
                <option value="">…</option>
                {lists
                  .filter((l) => l.id !== task.list_id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            className={menuItemClass(true)}
            onClick={() => {
              setMenuPos(null);
              deleteWithUndo(task, basePath);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
