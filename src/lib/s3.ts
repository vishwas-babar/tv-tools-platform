import { S3Client } from "@aws-sdk/client-s3";

/**
 * Singleton S3 client.
 * Reads credentials from environment variables at runtime.
 */
export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET!;

/**
 * Build the public URL for an uploaded object.
 * Works for path-style public buckets.
 */
export function getPublicUrl(key: string): string {
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
