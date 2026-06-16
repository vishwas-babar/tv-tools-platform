import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toolSchema } from "@/validations/tool";

// GET /api/tools — list all active tools (public)
export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        youtubeUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: tools });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}

// POST /api/tools — create a new tool (admin only)
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
    const parsed = toolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { name, slug, description, imageUrl, youtubeUrl, isActive } =
      parsed.data;

    const existing = await prisma.tool.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A tool with this slug already exists" },
        { status: 409 }
      );
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description,
        imageUrl: imageUrl || null,
        youtubeUrl: youtubeUrl || null,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: tool }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create tool" },
      { status: 500 }
    );
  }
}
