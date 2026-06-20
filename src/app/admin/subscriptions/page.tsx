import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatusBadgeFromRecord } from "@/components/subscription-status-badge";
import { GrantAccessButton } from "@/components/grant-access-button";
import { formatSubscriptionDateTime } from "@/lib/subscriptions";

export default async function AdminSubscriptionsPage() {
  const now = new Date();

  const [subscriptions, pendingCount, activeCount, expiredCount] =
    await Promise.all([
      prisma.subscription.findMany({
        include: {
          user: {
            select: { name: true, email: true, tradingViewId: true },
          },
          tool: { select: { name: true } },
          plan: { select: { name: true, durationDays: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.count({ where: { status: "PENDING_ACCESS" } }),
      prisma.subscription.count({
        where: { status: "ACTIVE", endDate: { gt: now } },
      }),
      prisma.subscription.count({
        where: { status: "ACTIVE", endDate: { lte: now } },
      }),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">
        Manage Subscriptions
      </h1>
      <p className="mt-1 text-foreground-secondary">
        Track pending access, active plans, and expired subscriptions.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning">
          Pending Access: {pendingCount}
        </span>
        <span className="rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success">
          Active: {activeCount}
        </span>
        <span className="rounded-full bg-surface-elevated px-3 py-1 text-sm font-medium text-foreground-secondary">
          Expired: {expiredCount}
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-center text-foreground-muted">
          No subscriptions found.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[960px] text-left text-sm">
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
                  Start Date
                </th>
                <th className="px-4 py-3 font-medium text-foreground-muted">
                  End Date
                </th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {sub.user.name}
                      </p>
                      <p className="text-xs text-foreground-muted">{sub.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {sub.user.tradingViewId || (
                      <span className="text-warning">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">{sub.tool.name}</td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    <p>{sub.plan.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {sub.plan.durationDays} days · ₹
                      {sub.plan.price.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {sub.startDate
                      ? formatSubscriptionDateTime(new Date(sub.startDate))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {sub.endDate
                      ? formatSubscriptionDateTime(new Date(sub.endDate))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionStatusBadgeFromRecord sub={sub} />
                  </td>
                  <td className="px-4 py-3">
                    {sub.status === "PENDING_ACCESS" ? (
                      <GrantAccessButton subscriptionId={sub.id} />
                    ) : (
                      <span className="text-xs text-foreground-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-foreground-muted">
        Grant access after adding the user to the TradingView tool.{" "}
        <Link href="/admin/users" className="text-primary-light hover:text-primary">
          View users
        </Link>{" "}
        to check TradingView IDs.
      </p>
    </div>
  );
}
