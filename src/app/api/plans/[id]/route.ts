import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { planSchema } from "@/validations/plan";
import { formatValidationError } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/plans/[id] — delete a plan (admin only)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.plan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Plan deleted" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}

// PATCH /api/plans/[id] — update a plan (admin only)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = planSchema.safeParse({
      ...body,
      durationDays: Number(body.durationDays),
      price: Number(body.price),
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

    const { name, durationDays, price } = parsed.data;

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name,
        durationDays,
        price,
      },
    });

    return NextResponse.json({ success: true, data: plan });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
