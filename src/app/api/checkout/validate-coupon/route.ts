import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  applyCouponToSubtotal,
  formatDiscountLabel,
} from "@/lib/coupon";
import { CheckoutError, computeCartPricing } from "@/lib/checkout-pricing";
import { checkoutWithCouponSchema } from "@/validations/checkout";

// POST /api/checkout/validate-coupon
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = checkoutWithCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid cart data" },
        { status: 422 },
      );
    }

    const { items, couponCode } = parsed.data;
    if (!couponCode) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 422 },
      );
    }

    const { subtotalAmount } = await computeCartPricing(session.user.id, items);
    const { coupon, discountAmount, totalAmount } = await applyCouponToSubtotal(
      subtotalAmount,
      couponCode,
    );

    return NextResponse.json({
      success: true,
      data: {
        couponCode: coupon.code,
        discountType: coupon.discountType,
        discountLabel: formatDiscountLabel(coupon),
        subtotalAmount,
        discountAmount,
        totalAmount,
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

    console.error("Validate coupon error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 },
    );
  }
}
