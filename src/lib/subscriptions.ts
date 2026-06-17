import type { SubscriptionStatus } from "@prisma/client";

export type SubscriptionDisplayStatus =
  | "PENDING_ACCESS"
  | "ACTIVE"
  | "EXPIRED";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** End date = activation time + N full 24-hour periods (e.g. 1pm + 7 days → 1pm). */
export function calculateSubscriptionEndDate(
  startDate: Date,
  durationDays: number
): Date {
  return new Date(startDate.getTime() + durationDays * MS_PER_DAY);
}

/** Active until endDate; expired at endDate and after. */
export function isSubscriptionExpired(endDate: Date, now = new Date()): boolean {
  return endDate.getTime() <= now.getTime();
}

export function isSubscriptionActive(
  status: SubscriptionStatus,
  endDate: Date | null,
  now = new Date()
): boolean {
  return (
    status === "ACTIVE" && endDate !== null && !isSubscriptionExpired(endDate, now)
  );
}

export function getSubscriptionDisplayStatus(sub: {
  status: SubscriptionStatus;
  endDate: Date | null;
}): SubscriptionDisplayStatus {
  if (sub.status === "PENDING_ACCESS") {
    return "PENDING_ACCESS";
  }

  if (sub.endDate && isSubscriptionExpired(sub.endDate)) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

export function formatSubscriptionDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const subscriptionStatusLabels: Record<
  SubscriptionDisplayStatus,
  string
> = {
  PENDING_ACCESS: "Pending Access",
  ACTIVE: "Active",
  EXPIRED: "Expired",
};

export const subscriptionStatusStyles: Record<
  SubscriptionDisplayStatus,
  string
> = {
  PENDING_ACCESS: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};
