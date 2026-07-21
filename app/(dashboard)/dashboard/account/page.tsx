import Link from "next/link";
import { verifySession, getSubscription } from "@/lib/dal";
import { openBillingPortal } from "@/app/(dashboard)/dashboard/account/actions";

export default async function AccountPage() {
  const { email } = await verifySession();
  const subscription = await getSubscription();
  const isPro = subscription.plan === "pro" && subscription.status === "active";

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Account
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{email}</p>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current plan</p>
            <p className="text-xs capitalize text-zinc-500">
              {subscription.plan} · {subscription.status}
            </p>
          </div>
          {!isPro && (
            <Link
              href="/pricing"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {subscription.current_period_end && (
          <p className="mt-2 text-xs text-zinc-500">
            {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        )}

        {subscription.plan === "pro" && (
          <form action={openBillingPortal} className="mt-4">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
            >
              Manage billing
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
