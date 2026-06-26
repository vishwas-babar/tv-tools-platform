import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/validations/coupon";
import { formatValidationError } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/coupons/[id] — update coupon (admin only)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = couponSchema.safeParse({
      ...body,
      code: String(body.code ?? "").trim(),
      discountValue: Number(body.discountValue),
      active: Boolean(body.active),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          ...formatValidationError(parsed.error),
        },
        { status: 422 },
      );
    }

    if (
      parsed.data.discountType === "PERCENTAGE" &&
      parsed.data.discountValue > 100
    ) {
      return NextResponse.json(
        { success: false, error: "Percentage discount cannot exceed 100%" },
        { status: 422 },
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "A coupon with this code already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

// DELETE /api/coupons/[id] — delete coupon (admin only)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
