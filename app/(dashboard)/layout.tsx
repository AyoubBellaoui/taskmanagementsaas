import { verifySession, getSubscription } from "@/lib/dal";
import { getLists } from "@/lib/queries/lists";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real auth check for this render. proxy.ts already did an optimistic
  // redirect; this re-verifies against Supabase per the fork's auth guide,
  // since layouts don't re-run on client-side navigation.
  const { userId } = await verifySession();
  const [lists, subscription] = await Promise.all([
    getLists(userId),
    getSubscription(),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      <Sidebar lists={lists} plan={subscription.plan} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
