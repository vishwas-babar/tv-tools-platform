import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function computeDiscountAmount(
  subtotal: number,
  coupon: Pick<Coupon, "discountType" | "discountValue">,
): number {
  const discount =
    coupon.discountType === "PERCENTAGE"
      ? subtotal * (coupon.discountValue / 100)
      : coupon.discountValue;

  return Math.round(Math.min(subtotal, discount) * 100) / 100;
}

export function computeTotalAmount(
  subtotal: number,
  discountAmount: number,
): number {
  return Math.round(Math.max(0, subtotal - discountAmount) * 100) / 100;
}

export function formatDiscountLabel(
  coupon: Pick<Coupon, "discountType" | "discountValue">,
): string {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue}% off`
    : `₹${coupon.discountValue.toFixed(2)} off`;
}

export async function findActiveCoupon(code: string) {
  return prisma.coupon.findFirst({
    where: { code: code.toUpperCase(), active: true, usedAt: null },
  });
}

export async function assertCouponAvailable(couponId: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

  if (!coupon?.active || coupon.usedAt) {
    throw new Error("This coupon has already been used");
  }

  const existingOrder = await prisma.order.findFirst({
    where: {
      couponId,
      status: { in: ["PENDING", "PAID"] },
    },
  });

  if (existingOrder) {
    throw new Error(
      existingOrder.status === "PAID"
        ? "This coupon has already been used"
        : "This coupon is currently in use on another checkout",
    );
  }
}

export async function applyCouponToSubtotal(subtotal: number, code: string) {
  const coupon = await findActiveCoupon(code);
  if (!coupon) {
    throw new Error("Invalid or inactive coupon code");
  }

  await assertCouponAvailable(coupon.id);

  const discountAmount = computeDiscountAmount(subtotal, coupon);
  const totalAmount = computeTotalAmount(subtotal, discountAmount);

  return { coupon, discountAmount, totalAmount };
}

export async function markCouponAsUsed(couponId: string) {
  await prisma.coupon.updateMany({
    where: { id: couponId, usedAt: null },
    data: { usedAt: new Date(), active: false },
  });
}
