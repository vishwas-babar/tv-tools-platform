import { prisma } from "@/lib/prisma";
import { sendPurchaseEmails } from "@/lib/purchase-emails";

/**
 * Create pending subscriptions for a paid order.
 * Admin must manually grant TradingView access before they become active.
 */
export async function provisionSubscriptions(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          plan: { select: { durationDays: true } },
        },
      },
    },
  });

  if (!order || order.status !== "PAID") return;

  const existingSubs = await prisma.subscription.findMany({
    where: { orderId: order.id },
  });

  if (existingSubs.length > 0) return;

  await prisma.subscription.createMany({
    data: order.items.map((item) => ({
      userId: order.userId,
      toolId: item.toolId,
      planId: item.planId,
      orderId: order.id,
      status: "PENDING_ACCESS" as const,
    })),
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {},
    create: {
      userId: order.userId,
      amount: order.totalAmount,
      status: "SUCCESS",
      paymentProvider: "cashfree",
      orderId: order.id,
    },
  });

  sendPurchaseEmails(order.id).catch((error) => {
    console.error(`Failed to send purchase emails for order ${order.id}:`, error);
  });
}
