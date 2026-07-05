import { prisma } from "@/lib/prisma";
import { paidSubscriptionWhere } from "@/lib/subscriptions";

/**
 * Promotional price (in INR) at which a brand-new user can buy their very
 * first single tool.
 */
export const FIRST_TOOL_OFFER_PRICE = 9;

/**
 * A user qualifies for the first-tool offer only if they have never bought a
 * tool before — i.e. no paid orders and no subscriptions (including any that an
 * admin may have granted directly).
 */
export async function isEligibleForFirstToolOffer(
  userId: string,
): Promise<boolean> {
  const [paidOrders, subscriptions] = await Promise.all([
    prisma.order.count({ where: { userId, status: "PAID" } }),
    prisma.subscription.count({ where: paidSubscriptionWhere(userId) }),
  ]);

  return paidOrders === 0 && subscriptions === 0;
}
