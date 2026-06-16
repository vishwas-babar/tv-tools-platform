import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toolSchema } from "@/validations/tool";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tools/[id] — get a tool by ID (public)
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const tool = await prisma.tool.findUnique({
      where: { id },
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

// PATCH /api/tools/[id] — update a tool (admin only)
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

    const duplicate = await prisma.tool.findFirst({
      where: { slug, NOT: { id } },
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "A tool with this slug already exists" },
        { status: 409 }
      );
    }

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl: imageUrl || null,
        youtubeUrl: youtubeUrl || null,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: tool });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update tool" },
      { status: 500 }
    );
  }
}

// DELETE /api/tools/[id] — delete a tool (admin only)
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

    await prisma.tool.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Tool deleted" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete tool" },
      { status: 500 }
    );
  }
}
