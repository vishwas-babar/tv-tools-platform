import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSyncedAutopayState } from "@/lib/autopay-subscriptions";
import { resolveCheckoutAccess } from "@/lib/checkout-return-token";

// GET /api/checkout/autopay-sessions?order_id=xxx&token=yyy
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

    const order = await prisma.order.findUnique({
      where: { cashfreeOrderId },
      select: {
        id: true,
        userId: true,
        status: true,
        autopaySessions: true,
        totalAmount: true,
        cashfreeOrderId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

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
        order_id: synced.order.cashfreeOrderId,
        order_status: synced.order.status,
        total_amount: synced.order.totalAmount,
        sessions: synced.sessions,
        next_session: synced.nextSession,
        all_authorized: synced.allAuthorized,
        pending_count: synced.sessions.filter((entry) => !entry.authorized).length,
      },
    });
  } catch (error) {
    console.error("Autopay sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch autopay sessions" },
      { status: 500 },
    );
  }
}
