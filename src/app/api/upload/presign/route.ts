import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { s3, S3_BUCKET, getPublicUrl } from "@/lib/s3";
import { randomUUID } from "crypto";

// Allowed image MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Max file size: 5 MB
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * POST /api/upload/presign
 *
 * Body: { filename: string; contentType: string; size: number }
 *
 * Returns:
 *   { presignedUrl: string; publicUrl: string; key: string }
 *
 * The client should:
 *   1. PUT the file bytes directly to `presignedUrl`
 *   2. Store `publicUrl` as the tool's imageUrl
 */
export async function POST(request: Request) {
  // Admin only
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { filename, contentType, size } = body as {
    filename: string;
    contentType: string;
    size: number;
  };

  // Validate
  if (!filename || !contentType || !size) {
    return NextResponse.json(
      { success: false, error: "filename, contentType and size are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { success: false, error: `Unsupported file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 415 }
    );
  }

  if (size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: "File too large. Maximum size is 5 MB." },
      { status: 413 }
    );
  }

  // Build a unique S3 key: tools/<uuid>/<original-filename>
  const ext = filename.split(".").pop() ?? "jpg";
  const key = `tools/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
    // No ACL needed — bucket policy makes everything public
  });

  // Presigned URL valid for 5 minutes
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = getPublicUrl(key);

  return NextResponse.json({ success: true, data: { presignedUrl, publicUrl, key } });
}
