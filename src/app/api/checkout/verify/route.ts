import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

// GET /api/checkout/verify?order_id=xxx
export async function GET(request: Request) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const cashfreeOrderId = url.searchParams.get("order_id");

    if (!cashfreeOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 }
      );
    }

    // 2. Look up order and verify ownership
    const order = await prisma.order.findUnique({
      where: { cashfreeOrderId },
      include: {
        items: {
          include: {
            tool: { select: { name: true } },
            plan: { select: { name: true, durationDays: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 3. If already processed, return cached status
    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        data: {
          status: "PAID",
          order_id: order.cashfreeOrderId,
          amount: order.totalAmount,
          items: order.items.map((i) => ({
            tool: i.tool.name,
            plan: i.plan.name,
            durationDays: i.plan.durationDays,
          })),
        },
      });
    }

    if (order.status === "FAILED" || order.status === "EXPIRED") {
      return NextResponse.json({
        success: true,
        data: { status: order.status, order_id: order.cashfreeOrderId },
      });
    }

    // 4. Fetch payment status from Cashfree
    const cfResponse = await cashfree.PGOrderFetchPayments(cashfreeOrderId);

    const payments = cfResponse.data ?? [];

    // Check if any payment is successful
    const successfulPayment = payments.find(
      (p) => p.payment_status === "SUCCESS"
    );

    if (successfulPayment) {
      // Update order status and provision subscriptions
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      await provisionSubscriptions(order.id);

      // Re-fetch order to get updated items
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              tool: { select: { name: true } },
              plan: { select: { name: true, durationDays: true } },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          status: "PAID",
          order_id: order.cashfreeOrderId,
          amount: order.totalAmount,
          items:
            updatedOrder?.items.map((i) => ({
              tool: i.tool.name,
              plan: i.plan.name,
              durationDays: i.plan.durationDays,
            })) ?? [],
        },
      });
    }

    // Check if any payment has failed
    const failedPayment = payments.find(
      (p) =>
        p.payment_status === "FAILED" || p.payment_status === "USER_DROPPED"
    );

    if (failedPayment) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({
        success: true,
        data: { status: "FAILED", order_id: order.cashfreeOrderId },
      });
    }

    // Still pending
    return NextResponse.json({
      success: true,
      data: { status: "PENDING", order_id: order.cashfreeOrderId },
    });
  } catch (error) {
    console.error("Verify order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify order" },
      { status: 500 }
    );
  }
}
