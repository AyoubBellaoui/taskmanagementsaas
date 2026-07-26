import Link from "next/link";
import { ProductPreview } from "@/components/marketing/product-preview";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

function ListsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M3 8h3.5l1.4 2h4.2l1.4-2H17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v6.5a1 1 0 001 1h12a1 1 0 001-1V8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 8L5 4h10l1.5 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path
        d="M10.5 3H4a1 1 0 00-1 1v6.5a1 1 0 00.3.7l7.5 7.5a1 1 0 001.4 0l6.5-6.5a1 1 0 000-1.4L11.2 3.3a1 1 0 00-.7-.3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M11 2.5L4 12h5l-1 5.5L16 8h-5l1-5.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <rect x="3" y="8" width="14" height="9" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8h14M10 8v9M10 8C8.5 4.5 5 4.5 5 6.5S8.5 8 10 8zM10 8c1.5-3.5 5-3.5 5-1.5S11.5 8 10 8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  {
    title: "Lists & smart views",
    body: "Organize tasks into lists, then let Today and Upcoming surface what actually matters right now.",
    icon: <ListsIcon />,
  },
  {
    title: "Subtasks & tags",
    body: "Break work down a level deeper and cut across lists with tags — no rigid structure required.",
    icon: <TagIcon />,
  },
  {
    title: "Fast by default",
    body: "Built on Next.js Server Actions — every change saves instantly, no spinners, no sync delay.",
    icon: <BoltIcon />,
  },
  {
    title: "Free to start",
    body: "Free plan covers real day-to-day use. Upgrade only when you outgrow it.",
    icon: <GiftIcon />,
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex w-full flex-1 flex-col">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-[120px] dark:bg-indigo-500/25"
          />
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
            <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
              The simple way to keep your day{" "}
              <span className="text-indigo-600 dark:text-indigo-400">organized</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400">
              Lists, tasks, subtasks, tags, and smart views — everything you
              need to stop juggling your to-dos in your head.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Get started free
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-16 flex w-full justify-center">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl border-t border-slate-100 px-6 py-16 dark:border-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-900 dark:bg-slate-900/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {feature.icon}
                </span>
                <h2 className="mt-3 font-medium text-slate-900 dark:text-slate-50">{feature.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl border-t border-slate-100 px-6 py-16 dark:border-slate-900">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Free plan, Pro when you need it
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Start with 3 lists and 50 active tasks for free. Upgrade to Pro
              for unlimited everything.
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <p className="font-medium text-slate-900 dark:text-slate-50">Free</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">$0</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                3 lists · 50 active tasks · subtasks &amp; tags
              </p>
            </div>
            <div className="rounded-2xl border-2 border-indigo-600 p-6 dark:border-indigo-500">
              <p className="font-medium text-slate-900 dark:text-slate-50">Pro</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                $6<span className="text-sm font-normal text-slate-500">/mo</span>
              </p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Unlimited lists &amp; tasks · priority support
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/pricing" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View full plan details →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
