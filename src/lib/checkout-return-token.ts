import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function sign(message: string) {
  return crypto.createHmac("sha256", getSecret()).update(message).digest("hex");
}

export function createCheckoutReturnToken(
  cashfreeOrderId: string,
  userId: string,
) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const signature = sign(`${cashfreeOrderId}:${userId}:${exp}`);
  return `${exp}.${signature}`;
}

export function verifyCheckoutReturnToken(
  cashfreeOrderId: string,
  userId: string,
  token: string,
) {
  const [expStr, signature] = token.split(".");
  if (!expStr || !signature) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = sign(`${cashfreeOrderId}:${userId}:${expStr}`);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

/** Resolve the order owner from session or a short-lived post-payment return token. */
export async function resolveCheckoutAccess(
  cashfreeOrderId: string,
  sessionUserId: string | undefined,
  returnToken: string | null,
) {
  const order = await prisma.order.findUnique({
    where: { cashfreeOrderId },
    select: { userId: true },
  });

  if (!order) return { ok: false as const, reason: "not_found" as const };

  if (sessionUserId) {
    if (sessionUserId !== order.userId) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    return { ok: true as const, userId: sessionUserId };
  }

  if (returnToken && verifyCheckoutReturnToken(cashfreeOrderId, order.userId, returnToken)) {
    return { ok: true as const, userId: order.userId };
  }

  return { ok: false as const, reason: "unauthorized" as const };
}
