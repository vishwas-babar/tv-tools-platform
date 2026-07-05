import { prisma } from "@/lib/prisma";
import type { CartItemInput } from "@/validations/checkout";
import { paidSubscriptionWhere } from "@/lib/subscriptions";

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type PricedOrderItem = {
  toolId: string;
  planId: string;
  price: number;
};

export async function computeCartPricing(
  userId: string,
  items: CartItemInput[],
): Promise<{ orderItems: PricedOrderItem[]; subtotalAmount: number }> {
  const uniqueToolIds = new Set(items.map((item) => item.toolId));
  if (uniqueToolIds.size !== items.length) {
    throw new CheckoutError("Only one plan can be selected per tool");
  }

  const toolIds = [...new Set(items.map((item) => item.toolId))];
  const planIds = [...new Set(items.map((item) => item.planId))];

  const [tools, plans] = await Promise.all([
    prisma.tool.findMany({
      where: { id: { in: toolIds }, isActive: true },
      select: { id: true, name: true },
    }),
    prisma.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true, price: true },
    }),
  ]);

  const toolMap = new Map(tools.map((tool) => [tool.id, tool]));
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  for (const item of items) {
    if (!toolMap.has(item.toolId)) {
      throw new CheckoutError(`Tool not found or inactive: ${item.toolId}`);
    }
    if (!planMap.has(item.planId)) {
      throw new CheckoutError(`Plan not found: ${item.planId}`);
    }
  }

  const existingSubscriptions = await prisma.subscription.findMany({
    where: {
      ...paidSubscriptionWhere(userId),
      toolId: { in: items.map((item) => item.toolId) },
      OR: [
        { status: "PENDING_ACCESS" },
        { status: "ACTIVE", endDate: { gt: new Date() } },
      ],
    },
    select: { toolId: true },
  });

  if (existingSubscriptions.length > 0) {
    const duplicateToolNames = existingSubscriptions
      .map((subscription) => toolMap.get(subscription.toolId)?.name ?? subscription.toolId)
      .join(", ");
    throw new CheckoutError(
      `You already have active subscriptions for: ${duplicateToolNames}`,
    );
  }

  const orderItems = items.map((item) => {
    const plan = planMap.get(item.planId)!;
    return {
      toolId: item.toolId,
      planId: item.planId,
      price: plan.price,
    };
  });

  const subtotalAmount =
    Math.round(orderItems.reduce((sum, item) => sum + item.price, 0) * 100) /
    100;

  if (subtotalAmount <= 0) {
    throw new CheckoutError("Invalid order total");
  }

  return { orderItems, subtotalAmount };
}
