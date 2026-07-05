import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyCouponToSubtotal, assertCouponAvailable } from "@/lib/coupon";
import { CheckoutError, computeCartPricing } from "@/lib/checkout-pricing";
import {
  FIRST_TOOL_OFFER_PRICE,
  isEligibleForFirstToolOffer,
} from "@/lib/first-purchase";
import { provisionSubscriptions } from "@/lib/provision-subscriptions";
import { checkoutWithCouponSchema } from "@/validations/checkout";
import { formatValidationError } from "@/lib/validation";
import {
  createCashfreeSubscription,
  getNextBillingDate,
  planDurationToCashfreeInterval,
  type AutopaySessionRecord,
} from "@/lib/cashfree-subscriptions";
import { createCheckoutReturnToken } from "@/lib/checkout-return-token";

function getCashfreeErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;

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

// POST /api/checkout/create-order
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const parsed = checkoutWithCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, ...formatValidationError(parsed.error) },
        { status: 422 },
      );
    }

    const { items, couponCode } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, name: true },
    });

    if (!user || !user.phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required for checkout" },
        { status: 400 },
      );
    }

    const { orderItems, subtotalAmount } = await computeCartPricing(
      userId,
      items,
    );

    const planIds = [...new Set(orderItems.map((item) => item.planId))];
    const toolIds = [...new Set(orderItems.map((item) => item.toolId))];

    const [plans, tools] = await Promise.all([
      prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true, price: true, durationDays: true },
      }),
      prisma.tool.findMany({
        where: { id: { in: toolIds } },
        select: { id: true, name: true },
      }),
    ]);

    const planMap = new Map(plans.map((plan) => [plan.id, plan]));
    const toolMap = new Map(tools.map((tool) => [tool.id, tool]));

    let totalAmount = subtotalAmount;
    let discountAmount = 0;
    let couponId: string | undefined;
    let appliedCouponCode: string | undefined;
    let firstToolOfferApplied = false;
    const firstToolEligible = await isEligibleForFirstToolOffer(userId);

    if (couponCode) {
      const applied = await applyCouponToSubtotal(subtotalAmount, couponCode);
      totalAmount = applied.totalAmount;
      discountAmount = applied.discountAmount;
      couponId = applied.coupon.id;
      appliedCouponCode = applied.coupon.code;
      await assertCouponAvailable(couponId);
    } else if (
      items.length === 1 &&
      subtotalAmount > FIRST_TOOL_OFFER_PRICE &&
      firstToolEligible
    ) {
      totalAmount = FIRST_TOOL_OFFER_PRICE;
      discountAmount =
        Math.round((subtotalAmount - FIRST_TOOL_OFFER_PRICE) * 100) / 100;
      firstToolOfferApplied = true;
    }

    const cashfreeOrderId = `order_${Date.now()}_${userId.slice(-6)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const order = await prisma.order.create({
      data: {
        userId,
        subtotalAmount,
        discountAmount:
          couponCode || firstToolOfferApplied ? discountAmount : null,
        couponId: couponId ?? null,
        couponCode: firstToolOfferApplied
          ? "FIRST-TOOL OFFER"
          : appliedCouponCode ?? null,
        totalAmount,
        status: "PENDING",
        cashfreeOrderId,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    if (totalAmount === 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
      await provisionSubscriptions(order.id);

      return NextResponse.json({
        success: true,
        data: {
          is_free: true,
          cashfree_order_id: cashfreeOrderId,
          subtotal_amount: subtotalAmount,
          discount_amount: discountAmount,
          total_amount: 0,
        },
      });
    }

    const autopaySessions: AutopaySessionRecord[] = [];
    const checkoutReturnToken = createCheckoutReturnToken(cashfreeOrderId, userId);
    const checkoutStatusUrl = `${appUrl}/checkout/status?order_id=${cashfreeOrderId}&token=${checkoutReturnToken}`;

    try {
      for (let index = 0; index < order.items.length; index++) {
        const item = order.items[index];
        const plan = planMap.get(item.planId);
        const tool = toolMap.get(item.toolId);

        if (!plan || !tool) {
          throw new CheckoutError("Invalid cart item");
        }

        const recurringAmount = plan.price;
        const isFirstToolItem =
          firstToolOfferApplied && order.items.length === 1 && index === 0;
        const authorizationAmount = isFirstToolItem
          ? FIRST_TOOL_OFFER_PRICE
          : recurringAmount;

        const { planIntervalType, planIntervals } =
          planDurationToCashfreeInterval(plan.durationDays);
        const cashfreeSubscriptionId = `sub_${order.id.slice(-8)}_${index}_${Date.now()}`;
        const firstChargeTime = getNextBillingDate(
          new Date(),
          plan.durationDays,
        );

        const cfSubscription = await createCashfreeSubscription({
          subscriptionId: cashfreeSubscriptionId,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          planName: `${tool.name} - ${plan.name}`,
          planAmount: recurringAmount,
          planMaxAmount: Math.max(recurringAmount, authorizationAmount),
          planIntervalType,
          planIntervals,
          authorizationAmount,
          firstChargeTime,
          returnUrl: checkoutStatusUrl,
          planNote: `${tool.name} autopay subscription`,
        });

        autopaySessions.push({
          subscriptionId: cashfreeSubscriptionId,
          subscriptionSessionId: cfSubscription.subscription_session_id,
          cfSubscriptionId: cfSubscription.cf_subscription_id,
          toolId: item.toolId,
          planId: item.planId,
          toolName: tool.name,
          recurringAmount,
          firstChargeAmount: authorizationAmount,
          authorized: false,
        });
      }
    } catch (cashfreeError) {
      await prisma.order.delete({ where: { id: order.id } });

      const message = getCashfreeErrorMessage(cashfreeError);
      console.error("Cashfree subscription create error:", cashfreeError);
      return NextResponse.json(
        {
          success: false,
          error: message ?? "Failed to create autopay subscription",
        },
        { status: 400 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { autopaySessions },
    });

    const firstSession = autopaySessions[0];

    return NextResponse.json({
      success: true,
      data: {
        is_autopay: true,
        cashfree_order_id: cashfreeOrderId,
        subtotal_amount: subtotalAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        subscription_id: firstSession.subscriptionId,
        subscription_session_id: firstSession.subscriptionSessionId,
        subscription_sessions: autopaySessions,
        autopay_redirect_url: `${appUrl}/checkout/autopay?order_id=${cashfreeOrderId}&token=${checkoutReturnToken}`,
        checkout_return_token: checkoutReturnToken,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("Create order error:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "This coupon has already been used" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 },
    );
  }
}
