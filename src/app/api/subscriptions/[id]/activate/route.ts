import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSubscriptionEndDate } from "@/lib/subscriptions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/subscriptions/[id]/activate — grant TradingView access (admin only)
export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: { select: { durationDays: true } } },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (subscription.status !== "PENDING_ACCESS") {
      return NextResponse.json(
        { success: false, error: "Subscription is not pending access" },
        { status: 400 }
      );
    }

    const now = new Date();
    const endDate = calculateSubscriptionEndDate(
      now,
      subscription.plan.durationDays
    );

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Activate subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate subscription" },
      { status: 500 }
    );
  }
}
