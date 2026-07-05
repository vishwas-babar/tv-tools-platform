import type { AutopayStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { markCouponAsUsed } from "@/lib/coupon";
import { sendPurchaseEmails } from "@/lib/purchase-emails";
import {
  getNextBillingDate,
  parseAutopaySessions,
  fetchCashfreeSubscription,
  type AutopaySessionRecord,
} from "@/lib/cashfree-subscriptions";
import { calculateSubscriptionEndDate } from "@/lib/subscriptions";

type SubscriptionPaymentWebhookData = {
  subscription_id?: string;
  cf_subscription_id?: string;
  payment_id?: string;
  payment_amount?: number;
  payment_status?: string;
  payment_type?: string;
  payment_schedule_date?: string;
};

function mapCashfreeAutopayStatus(status?: string): AutopayStatus | undefined {
  const allowed: AutopayStatus[] = [
    "INITIALIZED",
    "BANK_APPROVAL_PENDING",
    "ACTIVE",
    "ON_HOLD",
    "PAUSED",
    "COMPLETED",
    "CUSTOMER_CANCELLED",
    "CUSTOMER_PAUSED",
    "EXPIRED",
    "LINK_EXPIRED",
    "CARD_EXPIRED",
    "CANCELLED",
  ];

  if (!status) return undefined;
  return allowed.includes(status as AutopayStatus)
    ? (status as AutopayStatus)
    : undefined;
}

async function markAutopaySessionAuthorized(
  orderId: string,
  cashfreeSubscriptionId: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { autopaySessions: true },
  });

  if (!order) return;

  const sessions = parseAutopaySessions(order.autopaySessions).map((session) =>
    session.subscriptionId === cashfreeSubscriptionId
      ? { ...session, authorized: true }
      : session,
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { autopaySessions: sessions },
  });
}

async function findAutopayContext(cashfreeSubscriptionId: string) {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "PAID"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  for (const order of orders) {
    const sessions = parseAutopaySessions(order.autopaySessions);
    const session = sessions.find(
      (entry) => entry.subscriptionId === cashfreeSubscriptionId,
    );
    if (session) {
      return { order, session, sessions };
    }
  }

  return null;
}

async function createSubscriptionFromAutopaySession(
  orderId: string,
  userId: string,
  session: AutopaySessionRecord,
) {
  const existing = await prisma.subscription.findUnique({
    where: { cashfreeSubscriptionId: session.subscriptionId },
    include: { plan: { select: { durationDays: true } } },
  });

  if (existing) return existing;

  const plan = await prisma.plan.findUnique({
    where: { id: session.planId },
    select: { durationDays: true },
  });

  if (!plan) return null;

  const now = new Date();

  return prisma.subscription.create({
    data: {
      userId,
      toolId: session.toolId,
      planId: session.planId,
      orderId,
      status: "PENDING_ACCESS",
      cashfreeSubscriptionId: session.subscriptionId,
      cfSubscriptionId: session.cfSubscriptionId,
      recurringAmount: session.recurringAmount,
      firstChargeAmount: session.firstChargeAmount,
      autopayStatus: "ACTIVE",
      autopayEnabled: true,
      nextBillingDate: getNextBillingDate(now, plan.durationDays),
    },
    include: { plan: { select: { durationDays: true } } },
  });
}

async function finalizePaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      subscriptions: true,
    },
  });

  if (!order) return;

  const sessions = parseAutopaySessions(order.autopaySessions);
  const authorizedSessions = sessions.filter((session) => session.authorized);

  if (authorizedSessions.length === 0) return;

  const paidAmount =
    Math.round(
      authorizedSessions.reduce(
        (sum, session) => sum + session.firstChargeAmount,
        0,
      ) * 100,
    ) / 100;

  const wasAlreadyPaid = order.status === "PAID";

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      totalAmount: paidAmount,
    },
  });

  if (!wasAlreadyPaid && order.couponId) {
    await markCouponAsUsed(order.couponId);
  }

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { amount: paidAmount, status: "SUCCESS" },
    create: {
      userId: order.userId,
      amount: paidAmount,
      status: "SUCCESS",
      paymentProvider: "cashfree",
      orderId: order.id,
    },
  });

  if (!wasAlreadyPaid) {
    sendPurchaseEmails(order.id).catch((error) => {
      console.error(`Failed to send purchase emails for order ${order.id}:`, error);
    });
  }
}

export async function handleSubscriptionStatusChanged(data: {
  subscription_id?: string;
  cf_subscription_id?: string;
  subscription_status?: string;
}) {
  const subscription = await findSubscriptionForAutopayEvent(data);
  if (!subscription) return;

  const autopayStatus = mapCashfreeAutopayStatus(data.subscription_status);
  if (!autopayStatus) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      autopayStatus,
      ...(autopayStatus === "ACTIVE" && !subscription.nextBillingDate
        ? {
            nextBillingDate: getNextBillingDate(
              new Date(),
              subscription.plan.durationDays,
            ),
          }
        : {}),
    },
  });
}

async function findSubscriptionForAutopayEvent(data: {
  subscription_id?: string;
  cf_subscription_id?: string;
}) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        data.subscription_id
          ? { cashfreeSubscriptionId: data.subscription_id }
          : undefined,
        data.cf_subscription_id
          ? { cfSubscriptionId: data.cf_subscription_id }
          : undefined,
      ].filter(Boolean) as Prisma.SubscriptionWhereInput[],
    },
    include: { plan: { select: { durationDays: true } } },
  });

  if (subscription) return subscription;

  const cashfreeSubscriptionId = data.subscription_id;
  if (!cashfreeSubscriptionId) return null;

  const context = await findAutopayContext(cashfreeSubscriptionId);
  if (!context) return null;

  return createSubscriptionFromAutopaySession(
    context.order.id,
    context.order.userId,
    context.session,
  );
}

export async function handleSubscriptionPaymentSuccess(
  data: SubscriptionPaymentWebhookData,
) {
  if (data.payment_status !== "SUCCESS") return;

  const cashfreeSubscriptionId = data.subscription_id;
  if (!cashfreeSubscriptionId) return;

  const paymentType = data.payment_type?.toUpperCase() ?? "AUTH";
  const now = new Date();

  if (paymentType === "AUTH") {
    const context = await findAutopayContext(cashfreeSubscriptionId);
    if (!context) return;

    await createSubscriptionFromAutopaySession(
      context.order.id,
      context.order.userId,
      context.session,
    );

    await markAutopaySessionAuthorized(context.order.id, cashfreeSubscriptionId);
    await finalizePaidOrder(context.order.id);
    return;
  }

  const subscription = await findSubscriptionForAutopayEvent(data);
  if (!subscription) return;

  const amount = data.payment_amount ?? subscription.firstChargeAmount ?? 0;

  const renewalStart =
    subscription.endDate && subscription.endDate > now
      ? subscription.endDate
      : now;
  const renewalEnd = calculateSubscriptionEndDate(
    renewalStart,
    subscription.plan.durationDays,
  );

  await prisma.$transaction([
    prisma.renewalPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        status: "SUCCESS",
        providerPaymentId: data.payment_id ?? null,
        billingPeriodStart: renewalStart,
        billingPeriodEnd: renewalEnd,
      },
    }),
    prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        autopayStatus: "ACTIVE",
        status: subscription.status === "ACTIVE" ? "ACTIVE" : subscription.status,
        startDate: subscription.startDate ?? now,
        endDate: renewalEnd,
        nextBillingDate: getNextBillingDate(
          renewalEnd,
          subscription.plan.durationDays,
        ),
      },
    }),
  ]);
}

export function getNextPendingAutopaySession(
  sessions: AutopaySessionRecord[],
): AutopaySessionRecord | null {
  return sessions.find((session) => !session.authorized) ?? null;
}

export async function syncAutopayOrderStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, autopaySessions: true },
  });

  if (!order) return null;

  const sessions = parseAutopaySessions(order.autopaySessions);
  if (sessions.length === 0) return order.status;

  const authorizedCount = sessions.filter((session) => session.authorized).length;
  if (authorizedCount > 0) {
    await finalizePaidOrder(order.id);
    return "PAID";
  }

  return order.status;
}

/** Poll Cashfree when webhooks haven't arrived yet (common in local/sandbox). */
export async function syncAutopayFromCashfree(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, autopaySessions: true },
  });

  if (!order) return;

  const sessions = parseAutopaySessions(order.autopaySessions);
  const pendingSessions = sessions.filter((session) => !session.authorized);

  for (const session of pendingSessions) {
    try {
      const cfSubscription = await fetchCashfreeSubscription(
        session.subscriptionId,
      );
      const status = cfSubscription.subscription_status;
      const authStatus =
        cfSubscription.authorisation_details?.authorization_status;

      const authorized =
        status === "ACTIVE" ||
        status === "BANK_APPROVAL_PENDING" ||
        authStatus === "SUCCESS";

      if (!authorized) continue;

      const context = await findAutopayContext(session.subscriptionId);
      if (!context) continue;

      await createSubscriptionFromAutopaySession(
        context.order.id,
        context.order.userId,
        context.session,
      );
      await markAutopaySessionAuthorized(order.id, session.subscriptionId);
    } catch (error) {
      console.error(
        `Failed to sync Cashfree subscription ${session.subscriptionId}:`,
        error,
      );
    }
  }

  await syncAutopayOrderStatus(orderId);
}

export function buildAutopayContinueUrl(
  cashfreeOrderId: string,
  returnToken?: string | null,
) {
  return `/checkout/autopay?order_id=${cashfreeOrderId}${
    returnToken ? `&token=${encodeURIComponent(returnToken)}` : ""
  }`;
}

/** Sync pending sessions from Cashfree, then return up-to-date autopay state. */
export async function getSyncedAutopayState(
  orderId: string,
  returnToken?: string | null,
) {
  await syncAutopayFromCashfree(orderId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          tool: { select: { name: true } },
          plan: { select: { name: true, durationDays: true } },
        },
      },
    },
  });

  if (!order) return null;

  const sessions = parseAutopaySessions(order.autopaySessions);
  const authorizedSessions = sessions.filter((session) => session.authorized);
  const paidItems = order.items.filter((item) =>
    authorizedSessions.some(
      (session) =>
        session.toolId === item.toolId && session.planId === item.planId,
    ),
  );
  const nextSession = getNextPendingAutopaySession(sessions);
  const allAuthorized =
    sessions.length > 0 && sessions.every((entry) => entry.authorized);

  return {
    order,
    sessions,
    paidItems,
    nextSession,
    allAuthorized,
    autopay_continue_url: nextSession
      ? buildAutopayContinueUrl(order.cashfreeOrderId, returnToken)
      : null,
  };
}
