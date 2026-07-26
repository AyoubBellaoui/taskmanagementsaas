import Link from "next/link";
import { getUser } from "@/lib/dal";
import { CheckoutButton } from "@/components/paddle/checkout-button";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { FREE_PLAN_LIST_LIMIT, FREE_PLAN_ACTIVE_TASK_LIMIT } from "@/lib/plan-limits";

export default async function PricingPage() {
  // getUser(), not verifySession() — anonymous visitors must see this page.
  const user = await getUser();

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex w-full flex-1 flex-col">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-[120px] dark:bg-indigo-500/25"
          />
          <div className="relative mx-auto flex w-full max-w-4xl flex-col px-6 pb-20 pt-20 sm:pt-28">
            <div className="text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
                Simple pricing
              </h1>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Start free. Upgrade whenever you outgrow it.
              </p>
            </div>

            <div className="mx-auto mt-12 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-slate-200 p-8 dark:border-slate-800">
                <h2 className="font-medium text-slate-900 dark:text-slate-50">Free</h2>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50">$0</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>Up to {FREE_PLAN_LIST_LIMIT} lists</li>
                  <li>Up to {FREE_PLAN_ACTIVE_TASK_LIMIT} active tasks</li>
                  <li>Subtasks &amp; tags</li>
                  <li>Today &amp; Upcoming smart views</li>
                </ul>
                <Link
                  href={user ? "/dashboard" : "/signup"}
                  className="mt-8 rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {user ? "Go to dashboard" : "Get started"}
                </Link>
              </div>

              <div className="flex flex-col rounded-2xl border-2 border-indigo-600 p-8 dark:border-indigo-500">
                <h2 className="font-medium text-slate-900 dark:text-slate-50">Pro</h2>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                  $6<span className="text-base font-normal text-slate-500 dark:text-slate-400">/mo</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>Unlimited lists</li>
                  <li>Unlimited tasks</li>
                  <li>Subtasks &amp; tags</li>
                  <li>Today &amp; Upcoming smart views</li>
                  <li>Priority support</li>
                </ul>
                <CheckoutButton
                  priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO ?? ""}
                  userId={user?.id}
                  email={user?.email ?? undefined}
                  className="mt-8 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
