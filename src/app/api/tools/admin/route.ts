import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/tools/admin — list ALL tools including inactive (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tools = await prisma.tool.findMany({
      include: {
        _count: { select: { plans: true, subscriptions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tools });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}
