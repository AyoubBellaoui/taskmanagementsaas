import Link from "next/link";
import { getUser } from "@/lib/dal";
import { CheckoutButton } from "@/components/paddle/checkout-button";
import { FREE_PLAN_LIST_LIMIT, FREE_PLAN_ACTIVE_TASK_LIMIT } from "@/lib/plan-limits";

export default async function PricingPage() {
  // getUser(), not verifySession() — anonymous visitors must see this page.
  const user = await getUser();

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
      <Link href="/" className="mb-12 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Flowlist
      </Link>

      <div className="text-center">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Simple pricing
        </h1>
        <p className="mt-2 text-zinc-500">
          Start free. Upgrade whenever you outgrow it.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-zinc-200 p-8 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="mt-1 text-3xl font-semibold">$0</p>
          <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Up to {FREE_PLAN_LIST_LIMIT} lists</li>
            <li>Up to {FREE_PLAN_ACTIVE_TASK_LIMIT} active tasks</li>
            <li>Subtasks &amp; tags</li>
            <li>Today &amp; Upcoming smart views</li>
          </ul>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="mt-8 rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-medium dark:border-zinc-700"
          >
            {user ? "Go to dashboard" : "Get started"}
          </Link>
        </div>

        <div className="flex flex-col rounded-xl border-2 border-zinc-900 p-8 dark:border-zinc-50">
          <h2 className="text-lg font-semibold">Pro</h2>
          <p className="mt-1 text-3xl font-semibold">
            $6<span className="text-base font-normal text-zinc-500">/mo</span>
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
            className="mt-8 rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
          />
        </div>
      </div>
    </div>
  );
}
