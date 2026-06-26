import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { planSchema } from "@/validations/plan";
import { formatValidationError } from "@/lib/validation";

// GET /api/plans — get all global plans (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const plans = await prisma.plan.findMany({
      orderBy: { durationDays: "asc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST /api/plans — create a new global plan (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
        { status: 422 }
      );
    }

    const { name, durationDays, price } = parsed.data;

    const plan = await prisma.plan.create({
      data: {
        name,
        durationDays,
        price,
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
