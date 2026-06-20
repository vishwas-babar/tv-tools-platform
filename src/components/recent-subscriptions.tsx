import Link from "next/link";
import { SubscriptionStatusBadgeFromRecord } from "@/components/subscription-status-badge";
import { formatSubscriptionDateTime } from "@/lib/subscriptions";

interface RecentSubscription {
  id: string;
  status: "PENDING_ACCESS" | "ACTIVE";
  endDate: Date | null;
  createdAt: Date;
  tool: { name: string; slug: string };
  plan: { name: string };
}

interface RecentSubscriptionsProps {
  subscriptions: RecentSubscription[];
}

export function RecentSubscriptions({ subscriptions }: RecentSubscriptionsProps) {
  if (subscriptions.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Subscriptions</h2>
        <Link
          href="/purchases"
          className="text-sm font-medium text-primary-light hover:text-primary"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground-muted">Tool</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Plan</th>
              <th className="hidden px-4 py-3 font-medium text-foreground-muted sm:table-cell">
                Purchased
              </th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-surface-elevated/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/tools/${sub.tool.slug}`}
                    className="font-medium text-foreground hover:text-primary-light"
                  >
                    {sub.tool.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground-secondary">{sub.plan.name}</td>
                <td className="hidden px-4 py-3 text-foreground-secondary sm:table-cell">
                  {formatSubscriptionDateTime(new Date(sub.createdAt))}
                </td>
                <td className="px-4 py-3">
                  <SubscriptionStatusBadgeFromRecord sub={sub} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
