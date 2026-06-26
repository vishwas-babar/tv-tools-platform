import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toolSchema } from "@/validations/tool";
import { formatValidationError } from "@/lib/validation";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

// GET /api/tools — list active tools with pagination (public)
// Query: ?page=1&limit=12&search=fibonacci
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    const search = searchParams.get("search")?.trim() ?? "";
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { slug: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
          plans: {
            select: {
              id: true,
              name: true,
              price: true,
              durationDays: true,
            },
            orderBy: { price: "asc" },
          },
        },
      }),
      prisma.tool.count({ where }),
    ]);

    const data = tools.map(({ plans, ...tool }) => {
      const lowestPlan = plans[0] ?? null;
      return {
        ...tool,
        planCount: plans.length,
        startingPrice: lowestPlan?.price ?? null,
        lowestPlan,
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
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
          ...formatValidationError(parsed.error),
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
