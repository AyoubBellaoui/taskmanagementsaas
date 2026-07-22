import { NewTaskForm } from "@/components/dashboard/new-task-form";
import { TaskList } from "@/components/dashboard/task-list";
import { InteractiveTaskList } from "@/components/dashboard/interactive-task-list";
import { TaskDetailPanel } from "@/components/dashboard/task-detail-panel";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { SelectionProvider } from "@/components/dashboard/selection-context";
import { BulkActionBar } from "@/components/dashboard/bulk-action-bar";
import type { TaskWithTags } from "@/lib/queries/tasks";
import type { List } from "@/lib/queries/lists";
import type { Tag } from "@/lib/queries/tags";

export function TaskBoard({
  title,
  tasks,
  completedTasks = [],
  lists,
  availableTags = [],
  basePath,
  selectedTaskId,
  emptyMessage = "Nothing here. Enjoy the quiet.",
  defaultListId,
  defaultDueDate,
  grouped = false,
  reorderable = false,
}: {
  title: string;
  tasks: TaskWithTags[];
  completedTasks?: TaskWithTags[];
  lists: List[];
  availableTags?: Tag[];
  basePath: string;
  selectedTaskId?: string;
  emptyMessage?: string;
  defaultListId?: string;
  defaultDueDate?: string;
  grouped?: boolean;
  reorderable?: boolean;
}) {
  return (
    <div className="flex h-full">
      <SelectionProvider>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
              {tasks.length > 0 && (
                <span className="text-sm tabular-nums text-slate-400 dark:text-slate-600">
                  {tasks.length}
                </span>
              )}
            </div>
            <BulkActionBar lists={lists} />
          </div>

          <NewTaskForm
            lists={lists}
            defaultListId={defaultListId}
            defaultDueDate={defaultDueDate}
          />

          <InteractiveTaskList
            tasks={tasks}
            basePath={basePath}
            emptyMessage={emptyMessage}
            grouped={grouped}
            reorderable={reorderable}
            availableTags={availableTags}
          />

          <CollapsibleSection label="Completed" count={completedTasks.length}>
            <TaskList tasks={completedTasks} basePath={basePath} />
          </CollapsibleSection>
        </div>

        {selectedTaskId && (
          <TaskDetailPanel taskId={selectedTaskId} basePath={basePath} />
        )}
      </SelectionProvider>
    </div>
  );
}
