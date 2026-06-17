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
      <h1 className="text-2xl font-bold text-gray-900">
        Manage Subscriptions
      </h1>
      <p className="mt-1 text-gray-600">
        Track pending access, active plans, and expired subscriptions.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          Pending Access: {pendingCount}
        </span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Active: {activeCount}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          Expired: {expiredCount}
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">
          No subscriptions found.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
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
                  Start Date
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  End Date
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {sub.user.name}
                      </p>
                      <p className="text-xs text-gray-500">{sub.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sub.user.tradingViewId || (
                      <span className="text-amber-600">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sub.tool.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{sub.plan.name}</p>
                    <p className="text-xs text-gray-500">
                      {sub.plan.durationDays} days · ₹
                      {sub.plan.price.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sub.startDate
                      ? formatSubscriptionDateTime(new Date(sub.startDate))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
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
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Grant access after adding the user to the TradingView tool.{" "}
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
          View users
        </Link>{" "}
        to check TradingView IDs.
      </p>
    </div>
  );
}
