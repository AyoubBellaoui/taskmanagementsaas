import Link from "next/link";

const FEATURES = [
  {
    title: "Lists & smart views",
    body: "Organize tasks into lists, then let Today and Upcoming surface what actually matters right now.",
  },
  {
    title: "Subtasks & tags",
    body: "Break work down a level deeper and cut across lists with tags — no rigid structure required.",
  },
  {
    title: "Fast by default",
    body: "Built on Next.js Server Actions — every change saves instantly, no spinners, no sync delay.",
  },
  {
    title: "Free to start",
    body: "Free plan covers real day-to-day use. Upgrade only when you outgrow it.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Flowlist
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Pricing
          </Link>
          <Link href="/login" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <section className="flex flex-col items-center py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            The simple way to keep your day organized
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-500">
            Lists, tasks, subtasks, tags, and smart views — everything you
            need to stop juggling your to-dos in your head.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Get started free
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              See pricing
            </Link>
          </div>
        </section>

        <section className="grid gap-6 border-t border-zinc-100 py-16 sm:grid-cols-2 dark:border-zinc-900">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                {feature.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{feature.body}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col items-center gap-4 border-t border-zinc-100 py-16 text-center dark:border-zinc-900">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Free plan, Pro when you need it
          </h2>
          <p className="max-w-md text-sm text-zinc-500">
            Start with 3 lists and 50 active tasks for free. Upgrade to Pro
            for unlimited everything.
          </p>
          <Link href="/pricing" className="text-sm font-medium underline">
            View plans
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 dark:border-zinc-900">
        © {new Date().getFullYear()} Flowlist.
      </footer>
    </div>
  );
}
