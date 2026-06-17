import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cashfree } from "@/lib/cashfree";
import { z } from "zod";

function getCashfreeErrorMessage(error: unknown): string | null {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return null;
}

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        toolId: z.string().min(1),
        planId: z.string().min(1),
      })
    )
    .min(1, "Cart must have at least one item"),
});

// POST /api/checkout/create-order
export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Validate request body
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid cart data" },
        { status: 422 }
      );
    }

    const { items } = parsed.data;

    const uniqueToolIds = new Set(items.map((i) => i.toolId));
    if (uniqueToolIds.size !== items.length) {
      return NextResponse.json(
        { success: false, error: "Only one plan can be selected per tool" },
        { status: 400 }
      );
    }

    // 3. Fetch user details (need phone + email for Cashfree)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, name: true },
    });

    if (!user || !user.phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required for checkout" },
        { status: 400 }
      );
    }

    // 4. Re-fetch prices from DB — NEVER trust client prices
    const toolIds = [...new Set(items.map((i) => i.toolId))];
    const planIds = [...new Set(items.map((i) => i.planId))];

    const [tools, plans] = await Promise.all([
      prisma.tool.findMany({
        where: { id: { in: toolIds }, isActive: true },
        select: { id: true, name: true },
      }),
      prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true, price: true, durationDays: true },
      }),
    ]);

    const toolMap = new Map(tools.map((t) => [t.id, t]));
    const planMap = new Map(plans.map((p) => [p.id, p]));

    // Validate that all tools and plans exist
    for (const item of items) {
      if (!toolMap.has(item.toolId)) {
        return NextResponse.json(
          { success: false, error: `Tool not found or inactive: ${item.toolId}` },
          { status: 400 }
        );
      }
      if (!planMap.has(item.planId)) {
        return NextResponse.json(
          { success: false, error: `Plan not found: ${item.planId}` },
          { status: 400 }
        );
      }
    }

    // 5. Check for existing active subscriptions (prevent duplicate purchases)
    const existingSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        endDate: { gte: new Date() },
        OR: items.map((item) => ({
          toolId: item.toolId,
          planId: item.planId,
        })),
      },
      select: { toolId: true, planId: true },
    });

    if (existingSubscriptions.length > 0) {
      const dupeToolNames = existingSubscriptions
        .map((s) => toolMap.get(s.toolId)?.name ?? s.toolId)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `You already have active subscriptions for: ${dupeToolNames}`,
        },
        { status: 400 }
      );
    }

    // 6. Compute total from DB prices
    const orderItems = items.map((item) => {
      const plan = planMap.get(item.planId)!;
      return {
        toolId: item.toolId,
        planId: item.planId,
        price: plan.price,
      };
    });

    const totalAmount = Math.round(
      orderItems.reduce((sum, item) => sum + item.price, 0) * 100
    ) / 100;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order total" },
        { status: 400 }
      );
    }

    // 7. Generate a unique order ID
    const cashfreeOrderId = `order_${Date.now()}_${userId.slice(-6)}`;

    // 8. Create the order in DB first
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        cashfreeOrderId,
        items: {
          create: orderItems,
        },
      },
    });

    // 9. Create Cashfree order
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cashfreeRequest = {
      order_amount: totalAmount,
      order_currency: "INR",
      order_id: cashfreeOrderId,
      customer_details: {
        customer_id: userId,
        customer_email: user.email,
        customer_phone: user.phone,
        customer_name: user.name,
      },
      order_meta: {
        return_url: `${appUrl}/checkout/status?order_id=${cashfreeOrderId}`,
      },
    };

    let paymentSessionId: string | undefined;

    try {
      const response = await cashfree.PGCreateOrder(cashfreeRequest);
      paymentSessionId = response.data?.payment_session_id;
    } catch (cashfreeError) {
      await prisma.order.delete({ where: { id: order.id } });

      const message = getCashfreeErrorMessage(cashfreeError);
      console.error("Cashfree create order error:", cashfreeError);
      return NextResponse.json(
        { success: false, error: message ?? "Failed to create payment session" },
        { status: 400 }
      );
    }

    if (!paymentSessionId) {
      await prisma.order.delete({ where: { id: order.id } });
      return NextResponse.json(
        { success: false, error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    // 10. Save the payment session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentSessionId },
    });

    return NextResponse.json({
      success: true,
      data: {
        payment_session_id: paymentSessionId,
        cashfree_order_id: cashfreeOrderId,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
