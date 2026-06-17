import {
  getSubscriptionDisplayStatus,
  subscriptionStatusLabels,
  subscriptionStatusStyles,
  type SubscriptionDisplayStatus,
} from "@/lib/subscriptions";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionDisplayStatus;
}

export function SubscriptionStatusBadge({
  status,
}: SubscriptionStatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${subscriptionStatusStyles[status]}`}
    >
      {subscriptionStatusLabels[status]}
    </span>
  );
}

export function SubscriptionStatusBadgeFromRecord({
  sub,
}: {
  sub: {
    status: "PENDING_ACCESS" | "ACTIVE";
    endDate: Date | null;
  };
}) {
  const displayStatus = getSubscriptionDisplayStatus(sub);
  return <SubscriptionStatusBadge status={displayStatus} />;
}
