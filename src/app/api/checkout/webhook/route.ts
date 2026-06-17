import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cashfree } from "@/lib/cashfree";
import { provisionSubscriptions } from "@/lib/provision-subscriptions";

// POST /api/checkout/webhook — Cashfree webhook handler (public, no auth)
export async function POST(request: Request) {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    // 2. Verify webhook signature
    try {
      cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 3. Parse the verified payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.type;

    // We only care about payment success events
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderData = payload.data?.order;
      const cashfreeOrderId = orderData?.order_id;

      if (!cashfreeOrderId) {
        return NextResponse.json(
          { success: false, error: "Missing order_id in webhook" },
          { status: 400 }
        );
      }

      // 4. Find our order
      const order = await prisma.order.findUnique({
        where: { cashfreeOrderId },
      });

      if (!order) {
        console.error(`Webhook: Order not found for ${cashfreeOrderId}`);
        return NextResponse.json({ success: true }); // Return 200 anyway
      }

      // 5. Idempotent — ensure subscriptions exist for paid orders
      if (order.status === "PAID") {
        await provisionSubscriptions(order.id);
        return NextResponse.json({ success: true });
      }

      // 6. Mark as paid and provision subscriptions
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      await provisionSubscriptions(order.id);

      console.log(`Webhook: Successfully processed order ${cashfreeOrderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Return 200 to prevent Cashfree from retrying indefinitely
    return NextResponse.json({ success: true });
  }
}
