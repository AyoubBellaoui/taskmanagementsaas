"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemePref = "light" | "dark" | "system";

const THEME_CHANGE_EVENT = "flowlist:theme-change";

function applyTheme(pref: ThemePref) {
  const isDark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  if (pref === "system") {
    localStorage.removeItem("theme");
  } else {
    localStorage.setItem("theme", pref);
  }
  // Same-tab localStorage writes don't fire the native "storage" event —
  // that only fires in *other* tabs — so this is what tells this tab's
  // useSyncExternalStore subscribers to re-read the new value.
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

// useSyncExternalStore (not useEffect+setState) is the React-blessed way to
// read a browser-only store like localStorage without a hydration mismatch:
// it renders `getServerSnapshot` during SSR/hydration, then lets React itself
// — not user code — trigger the one-time correction to the real client value.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): ThemePref {
  return (localStorage.getItem("theme") as ThemePref | null) ?? "system";
}

function getServerSnapshot(): ThemePref {
  return "system";
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.4 3.6l-1 1M4.6 11.4l-1 1M12.4 12.4l-1-1M4.6 4.6l-1-1" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 106.9 7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <rect x="1.5" y="3" width="13" height="8.5" rx="1.2" />
      <path d="M5.5 14h5M8 11.5V14" strokeLinecap="round" />
    </svg>
  );
}

const OPTIONS: { value: ThemePref; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <SunIcon />, label: "Light" },
  { value: "system", icon: <SystemIcon />, label: "System" },
  { value: "dark", icon: <MoonIcon />, label: "Dark" },
];

export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Separate concern: while "system" is active, react to the OS preference
  // itself changing (no stored override to re-read, so this can't go
  // through the store above) — a genuine "subscribe to an external system"
  // effect, not a setState-in-effect.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (!localStorage.getItem("theme")) applyTheme("system");
    };
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []);

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.label}
          aria-pressed={pref === opt.value}
          onClick={() => applyTheme(opt.value)}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
            pref === opt.value
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
