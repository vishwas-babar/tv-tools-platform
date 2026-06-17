import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cashfree } from "@/lib/cashfree";

/**
 * Provision subscriptions for a paid order.
 * Idempotent — will not create duplicates if called multiple times.
 */
async function provisionSubscriptions(orderId: string) {
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

  // Check if subscriptions already exist for this order
  const existingSubs = await prisma.subscription.findMany({
    where: {
      userId: order.userId,
      OR: order.items.map((item) => ({
        toolId: item.toolId,
        planId: item.planId,
        startDate: { gte: order.createdAt },
      })),
    },
  });

  if (existingSubs.length > 0) return; // Already provisioned

  const now = new Date();

  // Create subscriptions for each order item
  await prisma.subscription.createMany({
    data: order.items.map((item) => ({
      userId: order.userId,
      toolId: item.toolId,
      planId: item.planId,
      startDate: now,
      endDate: new Date(
        now.getTime() + item.plan.durationDays * 24 * 60 * 60 * 1000
      ),
    })),
  });

  // Create payment record
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
}

// POST /api/checkout/webhook — Cashfree webhook handler (public, no auth)
export async function POST(request: Request) {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // 2. Verify webhook signature
    try {
      cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 3. Parse the verified payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.type;

    // We only care about payment success events
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderData = payload.data?.order;
      const cashfreeOrderId = orderData?.order_id;

      if (!cashfreeOrderId) {
        return NextResponse.json(
          { success: false, error: "Missing order_id in webhook" },
          { status: 400 }
        );
      }

      // 4. Find our order
      const order = await prisma.order.findUnique({
        where: { cashfreeOrderId },
      });

      if (!order) {
        console.error(`Webhook: Order not found for ${cashfreeOrderId}`);
        return NextResponse.json({ success: true }); // Return 200 anyway
      }

      // 5. Idempotent — skip if already processed
      if (order.status === "PAID") {
        return NextResponse.json({ success: true });
      }

      // 6. Mark as paid and provision subscriptions
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      await provisionSubscriptions(order.id);

      console.log(`Webhook: Successfully processed order ${cashfreeOrderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Return 200 to prevent Cashfree from retrying indefinitely
    return NextResponse.json({ success: true });
  }
}
