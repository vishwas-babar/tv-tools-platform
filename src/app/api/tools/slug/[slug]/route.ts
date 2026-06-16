import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/tools/slug/[slug] — get a tool by slug including plans (public)
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const tool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        plans: { orderBy: { durationDays: "asc" } },
      },
    });

    if (!tool) {
      return NextResponse.json(
        { success: false, error: "Tool not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tool });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tool" },
      { status: 500 }
    );
  }
}
