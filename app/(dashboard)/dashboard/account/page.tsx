import Link from "next/link";
import { verifySession, getSubscription } from "@/lib/dal";
import { openBillingPortal } from "@/app/(dashboard)/dashboard/account/actions";

export default async function AccountPage() {
  const { email } = await verifySession();
  const subscription = await getSubscription();
  const isPro = subscription.plan === "pro" && subscription.status === "active";

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Account
      </h1>
      <p className="mt-1 text-sm text-slate-500">{email}</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Current plan</p>
            <p className="text-xs capitalize text-slate-500">
              {subscription.plan} · {subscription.status}
            </p>
          </div>
          {!isPro && (
            <Link
              href="/pricing"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {subscription.current_period_end && (
          <p className="mt-2 text-xs text-slate-500">
            {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        )}

        {subscription.plan === "pro" && (
          <form action={openBillingPortal} className="mt-4">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Manage billing
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
