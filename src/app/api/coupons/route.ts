import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/validations/coupon";
import { formatValidationError } from "@/lib/validation";

// GET /api/coupons — list coupons (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}

// POST /api/coupons — create coupon (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = couponSchema.safeParse({
      ...body,
      code: String(body.code ?? "").trim(),
      discountValue: Number(body.discountValue),
      active: body.active ?? true,
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

    const coupon = await prisma.coupon.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
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
      { success: false, error: "Failed to create coupon" },
      { status: 500 },
    );
  }
}
