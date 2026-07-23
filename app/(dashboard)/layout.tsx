import { verifySession, getSubscription } from "@/lib/dal";
import { getLists } from "@/lib/queries/lists";
import { getListTaskCounts, getViewCounts } from "@/lib/queries/tasks";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { ToastProvider } from "@/components/dashboard/toast-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real auth check for this render. proxy.ts already did an optimistic
  // redirect; this re-verifies against Supabase per the fork's auth guide,
  // since layouts don't re-run on client-side navigation.
  const { userId, email } = await verifySession();
  const [lists, subscription, viewCounts, listCounts] = await Promise.all([
    getLists(userId),
    getSubscription(),
    getViewCounts(userId),
    getListTaskCounts(userId),
  ]);
  const defaultListId = lists.find((l) => l.is_default)?.id ?? lists[0]?.id;

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Sidebar
          lists={lists}
          listCounts={listCounts}
          viewCounts={viewCounts}
          plan={subscription.plan}
          email={email}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
        <CommandPalette lists={lists} defaultListId={defaultListId} />
      </div>
    </ToastProvider>
  );
}
