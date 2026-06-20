import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/dashboard-stats";
import { SubscriptionStatusBadgeFromRecord } from "@/components/subscription-status-badge";
import { GrantAccessButton } from "@/components/grant-access-button";

export default async function AdminDashboardPage() {
  const now = new Date();

  const [
    userCount,
    toolCount,
    pendingAccessCount,
    activeSubscriptionCount,
    expiredSubscriptionCount,
    pendingSubscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tool.count(),
    prisma.subscription.count({ where: { status: "PENDING_ACCESS" } }),
    prisma.subscription.count({
      where: { status: "ACTIVE", endDate: { gt: now } },
    }),
    prisma.subscription.count({
      where: { status: "ACTIVE", endDate: { lte: now } },
    }),
    prisma.subscription.findMany({
      where: { status: "PENDING_ACCESS" },
      include: {
        user: {
          select: { name: true, email: true, tradingViewId: true },
        },
        tool: { select: { name: true } },
        plan: { select: { name: true, durationDays: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Total Tools", value: toolCount },
    { label: "Pending Access", value: pendingAccessCount },
    { label: "Active Subscriptions", value: activeSubscriptionCount },
    { label: "Expired Plans", value: expiredSubscriptionCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="mt-1 text-foreground-secondary">
        Platform overview and subscription access management.
      </p>

      <div className="mt-6">
        <DashboardStats stats={stats} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Pending Access
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Paid subscriptions waiting for manual TradingView access.
            </p>
          </div>
          <Link
            href="/admin/subscriptions"
            className="text-sm font-medium text-primary-light hover:text-primary"
          >
            View all subscriptions
          </Link>
        </div>

        {pendingSubscriptions.length === 0 ? (
          <div className="mt-4 rounded-lg border border-border bg-surface p-6 text-center text-sm text-foreground-muted">
            No subscriptions pending access right now.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-elevated">
                <tr>
                  <th className="px-4 py-3 font-medium text-foreground-muted">User</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">
                    TradingView ID
                  </th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Tool</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Plan</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">
                    Purchased
                  </th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {sub.user.name}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {sub.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground-secondary">
                      {sub.user.tradingViewId || (
                        <span className="text-warning">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground-secondary">{sub.tool.name}</td>
                    <td className="px-4 py-3 text-foreground-secondary">
                      {sub.plan.name} · {sub.plan.durationDays} days
                    </td>
                    <td className="px-4 py-3 text-foreground-secondary">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionStatusBadgeFromRecord sub={sub} />
                    </td>
                    <td className="px-4 py-3">
                      <GrantAccessButton subscriptionId={sub.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
