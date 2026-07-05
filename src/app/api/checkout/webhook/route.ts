import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cashfree } from "@/lib/cashfree";
import { provisionSubscriptions } from "@/lib/provision-subscriptions";
import {
  handleSubscriptionPaymentSuccess,
  handleSubscriptionStatusChanged,
} from "@/lib/autopay-subscriptions";

const SUBSCRIPTION_WEBHOOK_TYPES = new Set([
  "SUBSCRIPTION_STATUS_CHANGED",
  "SUBSCRIPTION_AUTH_STATUS",
  "SUBSCRIPTION_PAYMENT_SUCCESS",
  "SUBSCRIPTION_PAYMENT_FAILED",
]);

// POST /api/checkout/webhook — Cashfree webhook handler (public, no auth)
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    try {
      cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type as string | undefined;

    if (eventType && SUBSCRIPTION_WEBHOOK_TYPES.has(eventType)) {
      const data = payload.data ?? {};

      if (
        eventType === "SUBSCRIPTION_STATUS_CHANGED" ||
        eventType === "SUBSCRIPTION_AUTH_STATUS"
      ) {
        await handleSubscriptionStatusChanged({
          subscription_id: data.subscription_id,
          cf_subscription_id: data.cf_subscription_id,
          subscription_status: data.subscription_status,
        });
      }

      if (eventType === "SUBSCRIPTION_PAYMENT_SUCCESS") {
        await handleSubscriptionPaymentSuccess({
          subscription_id: data.subscription_id,
          cf_subscription_id: data.cf_subscription_id,
          payment_id: data.payment_id ?? data.cf_payment_id,
          payment_amount: data.payment_amount,
          payment_status: data.payment_status,
          payment_type: data.payment_type,
          payment_schedule_date: data.payment_schedule_date,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderData = payload.data?.order;
      const cashfreeOrderId = orderData?.order_id;

      if (!cashfreeOrderId) {
        return NextResponse.json(
          { success: false, error: "Missing order_id in webhook" },
          { status: 400 },
        );
      }

      const order = await prisma.order.findUnique({
        where: { cashfreeOrderId },
      });

      if (!order) {
        console.error(`Webhook: Order not found for ${cashfreeOrderId}`);
        return NextResponse.json({ success: true });
      }

      if (order.status === "PAID") {
        await provisionSubscriptions(order.id);
        return NextResponse.json({ success: true });
      }

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
    return NextResponse.json({ success: true });
  }
}
