"use client";

import { useState } from "react";
import { addDays, addWeeks, format } from "date-fns";

const PRESETS = [
  { label: "Today", offset: (d: Date) => d },
  { label: "Tomorrow", offset: (d: Date) => addDays(d, 1) },
  { label: "Next week", offset: (d: Date) => addWeeks(d, 1) },
] as const;

export function DateQuickPicker({
  name,
  defaultValue,
  className,
}: {
  name: string;
  defaultValue?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  const applyPreset = (getDate: (d: Date) => Date) => {
    setValue(format(getDate(new Date()), "yyyy-MM-dd"));
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={className}
      />
      <div className="flex gap-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            title={preset.label}
            onClick={() => applyPreset(preset.offset)}
            className="rounded px-1.5 py-1 text-[10px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
          >
            {preset.label === "Next week" ? "Wk" : preset.label.slice(0, 3)}
          </button>
        ))}
        {value && (
          <button
            type="button"
            title="Clear date"
            onClick={() => setValue("")}
            className="rounded px-1.5 py-1 text-[10px] text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-white/5"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
