import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cashfree } from "@/lib/cashfree";
import { applyCouponToSubtotal, assertCouponAvailable } from "@/lib/coupon";
import { CheckoutError, computeCartPricing } from "@/lib/checkout-pricing";
import { provisionSubscriptions } from "@/lib/provision-subscriptions";
import { checkoutWithCouponSchema } from "@/validations/checkout";

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
        { success: false, error: "Invalid cart data" },
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

    let totalAmount = subtotalAmount;
    let discountAmount = 0;
    let couponId: string | undefined;
    let appliedCouponCode: string | undefined;

    if (couponCode) {
      const applied = await applyCouponToSubtotal(subtotalAmount, couponCode);
      totalAmount = applied.totalAmount;
      discountAmount = applied.discountAmount;
      couponId = applied.coupon.id;
      appliedCouponCode = applied.coupon.code;

      // Re-check right before creating the order to avoid race conditions.
      await assertCouponAvailable(couponId);
    }

    const cashfreeOrderId = `order_${Date.now()}_${userId.slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        userId,
        subtotalAmount,
        discountAmount: couponCode ? discountAmount : null,
        couponId: couponId ?? null,
        couponCode: appliedCouponCode ?? null,
        totalAmount,
        status: "PENDING",
        cashfreeOrderId,
        items: {
          create: orderItems,
        },
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
        { status: 400 },
      );
    }

    if (!paymentSessionId) {
      await prisma.order.delete({ where: { id: order.id } });
      return NextResponse.json(
        { success: false, error: "Failed to create payment session" },
        { status: 500 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentSessionId },
    });

    return NextResponse.json({
      success: true,
      data: {
        payment_session_id: paymentSessionId,
        cashfree_order_id: cashfreeOrderId,
        subtotal_amount: subtotalAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
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
