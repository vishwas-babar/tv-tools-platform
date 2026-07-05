import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionStatusBadgeFromRecord } from "@/components/subscription-status-badge";
import {
  formatSubscriptionDateTime,
  paidSubscriptionWhere,
} from "@/lib/subscriptions";

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    where: paidSubscriptionWhere(session.user.id),
    include: {
      tool: { select: { name: true, slug: true } },
      plan: { select: { name: true, durationDays: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Purchases</h1>
      <p className="mt-1 text-foreground-secondary">Your subscription history.</p>

      {subscriptions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-foreground-muted">
            You don&apos;t have any subscriptions yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground-muted">Tool</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Plan</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Price</th>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {sub.tool.name}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {sub.plan.name} · {sub.plan.durationDays} days
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    ₹{sub.plan.price.toFixed(2)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
