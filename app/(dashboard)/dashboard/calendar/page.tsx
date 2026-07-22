import Link from "next/link";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parse,
} from "date-fns";
import { verifySession } from "@/lib/dal";
import { getTasksInRange } from "@/lib/queries/tasks";
import { TaskDetailPanel } from "@/components/dashboard/task-detail-panel";
import type { TaskWithTags } from "@/lib/queries/tasks";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
  none: "bg-slate-400 dark:bg-slate-600",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; task?: string }>;
}) {
  const { userId } = await verifySession();
  const { month: monthParam, task } = await searchParams;

  const anchor =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? parse(monthParam, "yyyy-MM", new Date()) : new Date();
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const tasks = await getTasksInRange(
    userId,
    format(gridStart, "yyyy-MM-dd"),
    format(gridEnd, "yyyy-MM-dd"),
  );

  const byDay = new Map<string, TaskWithTags[]>();
  for (const t of tasks) {
    if (!t.due_date) continue;
    if (!byDay.has(t.due_date)) byDay.set(t.due_date, []);
    byDay.get(t.due_date)!.push(t);
  }

  const prevMonth = format(subMonths(monthStart, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthStart, 1), "yyyy-MM");
  const basePath = monthParam ? `/dashboard/calendar?month=${monthParam}` : "/dashboard/calendar";
  const taskHref = (id: string) => `${basePath}${basePath.includes("?") ? "&" : "?"}task=${id}`;

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {format(monthStart, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/calendar?month=${prevMonth}`}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              ‹
            </Link>
            <Link
              href="/dashboard/calendar"
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Today
            </Link>
            <Link
              href={`/dashboard/calendar?month=${nextMonth}`}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              ›
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-slate-50 px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-900 dark:text-slate-600"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, monthStart);
            const today = isToday(day);
            return (
              <div
                key={key}
                className={`min-h-[100px] bg-white p-1.5 dark:bg-slate-950 ${inMonth ? "" : "opacity-40"}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs tabular-nums ${
                    today
                      ? "bg-indigo-600 font-semibold text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <Link
                      key={t.id}
                      href={taskHref(t.id)}
                      className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] hover:bg-slate-100 dark:hover:bg-white/5 ${
                        t.completed
                          ? "text-slate-400 line-through dark:text-slate-600"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                      {t.title}
                    </Link>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="px-1 text-[10px] text-slate-400 dark:text-slate-600">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {task && <TaskDetailPanel taskId={task} basePath={basePath} />}
    </div>
  );
}
