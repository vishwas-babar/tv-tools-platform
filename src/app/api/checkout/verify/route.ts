import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cashfree } from "@/lib/cashfree";
import { provisionSubscriptions } from "@/lib/provision-subscriptions";
import { parseAutopaySessions } from "@/lib/cashfree-subscriptions";
import {
  getNextPendingAutopaySession,
  getSyncedAutopayState,
  syncAutopayOrderStatus,
  syncAutopayFromCashfree,
} from "@/lib/autopay-subscriptions";
import { resolveCheckoutAccess } from "@/lib/checkout-return-token";

// GET /api/checkout/verify?order_id=xxx&token=yyy
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cashfreeOrderId = url.searchParams.get("order_id");
    const returnToken = url.searchParams.get("token");

    if (!cashfreeOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 },
      );
    }

    const session = await auth();
    const access = await resolveCheckoutAccess(
      cashfreeOrderId,
      session?.user?.id,
      returnToken,
    );

    if (!access.ok) {
      const status =
        access.reason === "not_found"
          ? 404
          : access.reason === "forbidden"
            ? 403
            : 401;
      const message =
        access.reason === "not_found"
          ? "Order not found"
          : access.reason === "forbidden"
            ? "Unauthorized"
            : "Unauthorized";
      return NextResponse.json({ success: false, error: message }, { status });
    }

    // Look up order
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
        { status: 404 },
      );
    }

    // 3. If already processed, sync autopay sessions then return status
    if (order.status === "PAID") {
      const initialSessions = parseAutopaySessions(order.autopaySessions);

      if (initialSessions.length > 0) {
        const synced = await getSyncedAutopayState(order.id, returnToken);
        if (!synced) {
          return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 },
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            status: "PAID",
            order_id: synced.order.cashfreeOrderId,
            amount: synced.order.totalAmount,
            items: synced.paidItems.map((i) => ({
              tool: i.tool.name,
              plan: i.plan.name,
              durationDays: i.plan.durationDays,
            })),
            autopay_pending: Boolean(synced.nextSession),
            autopay_continue_url: synced.autopay_continue_url,
          },
        });
      }

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

    const autopaySessions = parseAutopaySessions(order.autopaySessions);
    if (autopaySessions.length > 0) {
      await syncAutopayFromCashfree(order.id);
      const syncedStatus = await syncAutopayOrderStatus(order.id);
      const refreshedOrder = await prisma.order.findUnique({
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

      if (!refreshedOrder) {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 },
        );
      }

      if (syncedStatus === "PAID") {
        const sessions = parseAutopaySessions(refreshedOrder.autopaySessions);
        const authorizedSessions = sessions.filter((session) => session.authorized);
        const paidItems = refreshedOrder.items.filter((item) =>
          authorizedSessions.some(
            (session) =>
              session.toolId === item.toolId && session.planId === item.planId,
          ),
        );
        const nextSession = getNextPendingAutopaySession(sessions);

        return NextResponse.json({
          success: true,
          data: {
            status: "PAID",
            order_id: refreshedOrder.cashfreeOrderId,
            amount: refreshedOrder.totalAmount,
            items: paidItems.map((i) => ({
              tool: i.tool.name,
              plan: i.plan.name,
              durationDays: i.plan.durationDays,
            })),
            autopay_pending: Boolean(nextSession),
            autopay_continue_url: nextSession
              ? `/checkout/autopay?order_id=${refreshedOrder.cashfreeOrderId}${
                  returnToken ? `&token=${encodeURIComponent(returnToken)}` : ""
                }`
              : null,
          },
        });
      }

      const nextSession = getNextPendingAutopaySession(
        parseAutopaySessions(refreshedOrder.autopaySessions),
      );

      return NextResponse.json({
        success: true,
        data: {
          status: "PENDING",
          order_id: refreshedOrder.cashfreeOrderId,
          autopay_pending: Boolean(nextSession),
          autopay_continue_url: nextSession
            ? `/checkout/autopay?order_id=${refreshedOrder.cashfreeOrderId}${
                returnToken ? `&token=${encodeURIComponent(returnToken)}` : ""
              }`
            : null,
        },
      });
    }

    // 4. Fetch payment status from Cashfree (legacy one-time orders)
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
