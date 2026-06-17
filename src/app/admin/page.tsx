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
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Platform overview and subscription access management.
      </p>

      <div className="mt-6">
        <DashboardStats stats={stats} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Access
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Paid subscriptions waiting for manual TradingView access.
            </p>
          </div>
          <Link
            href="/admin/subscriptions"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all subscriptions
          </Link>
        </div>

        {pendingSubscriptions.length === 0 ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            No subscriptions pending access right now.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    TradingView ID
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tool</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Plan</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Purchased
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {sub.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sub.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.user.tradingViewId || (
                        <span className="text-amber-600">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sub.tool.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.plan.name} · {sub.plan.durationDays} days
                    </td>
                    <td className="px-4 py-3 text-gray-600">
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
