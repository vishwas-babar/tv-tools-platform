import { CFEnvironment } from "cashfree-pg";

const CASHFREE_API_VERSION = "2025-01-01";

function getCashfreeBaseUrl() {
  return process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export type CashfreePlanIntervalType = "DAY" | "WEEK" | "MONTH" | "YEAR";

export type CreateCashfreeSubscriptionInput = {
  subscriptionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  planAmount: number;
  planMaxAmount: number;
  planIntervalType: CashfreePlanIntervalType;
  planIntervals: number;
  authorizationAmount: number;
  firstChargeTime: Date;
  returnUrl: string;
  planNote?: string;
};

export type CashfreeSubscriptionResponse = {
  subscription_id: string;
  cf_subscription_id: string;
  subscription_session_id: string;
  subscription_status: string;
  next_schedule_date?: string | null;
};

export type AutopaySessionRecord = {
  subscriptionId: string;
  subscriptionSessionId: string;
  cfSubscriptionId: string;
  toolId: string;
  planId: string;
  toolName: string;
  recurringAmount: number;
  firstChargeAmount: number;
  authorized: boolean;
  purchaseEmailSent?: boolean;
};

function cashfreeHeaders(idempotencyKey?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_APP_ID!,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
    "x-api-version": CASHFREE_API_VERSION,
  };

  if (idempotencyKey) {
    headers["x-idempotency-key"] = idempotencyKey;
  }

  return headers;
}

function getCashfreeErrorMessage(body: unknown): string | null {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return null;
}

/**
 * Map plan duration to Cashfree billing interval.
 *
 * Always use exact DAY intervals so autopay cadence matches our access period
 * (startDate + durationDays). Calendar MONTH/YEAR intervals drift — e.g. a
 * "30-day" plan billed every calendar month is 28–31 days, leaving gaps or
 * overlaps vs subscription endDate.
 */
export function planDurationToCashfreeInterval(durationDays: number): {
  planIntervalType: CashfreePlanIntervalType;
  planIntervals: number;
} {
  return { planIntervalType: "DAY", planIntervals: durationDays };
}

export function getSubscriptionExpiryTime(): string {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 10);
  return expiry.toISOString();
}

export function getNextBillingDate(
  from: Date,
  durationDays: number,
): Date {
  return new Date(from.getTime() + durationDays * 24 * 60 * 60 * 1000);
}

export async function createCashfreeSubscription(
  input: CreateCashfreeSubscriptionInput,
): Promise<CashfreeSubscriptionResponse> {
  const body = {
    subscription_id: input.subscriptionId,
    customer_details: {
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
    },
    plan_details: {
      plan_name: input.planName.slice(0, 40),
      plan_type: "PERIODIC",
      plan_currency: "INR",
      plan_amount: input.planAmount,
      plan_max_amount: input.planMaxAmount,
      plan_interval_type: input.planIntervalType,
      plan_intervals: input.planIntervals,
      plan_note: input.planNote ?? "",
    },
    authorization_details: {
      authorization_amount: input.authorizationAmount,
      authorization_amount_refund: false,
      payment_methods: ["upi", "card"],
    },
    subscription_meta: {
      return_url: input.returnUrl,
      notification_channel: ["EMAIL", "SMS"],
    },
    subscription_expiry_time: getSubscriptionExpiryTime(),
    subscription_first_charge_time: input.firstChargeTime.toISOString(),
  };

  const response = await fetch(`${getCashfreeBaseUrl()}/subscriptions`, {
    method: "POST",
    headers: cashfreeHeaders(input.subscriptionId),
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      getCashfreeErrorMessage(payload) ?? "Failed to create subscription mandate",
    );
  }

  if (
    !payload.subscription_id ||
    !payload.subscription_session_id ||
    !payload.cf_subscription_id
  ) {
    throw new Error("Invalid subscription response from payment gateway");
  }

  return payload as CashfreeSubscriptionResponse;
}

export async function fetchCashfreeSubscription(subscriptionId: string) {
  const response = await fetch(
    `${getCashfreeBaseUrl()}/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: "GET",
      headers: cashfreeHeaders(),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      getCashfreeErrorMessage(payload) ?? "Failed to fetch subscription status",
    );
  }

  return payload as {
    subscription_id: string;
    subscription_status?: string;
    authorisation_details?: {
      authorization_status?: string;
    };
  };
}

export function getCashfreeEnvironment() {
  return process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;
}

export function parseAutopaySessions(value: unknown): AutopaySessionRecord[] {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is AutopaySessionRecord => {
    if (!entry || typeof entry !== "object") return false;
    return (
      "subscriptionId" in entry &&
      "subscriptionSessionId" in entry &&
      "toolId" in entry &&
      "planId" in entry &&
      typeof entry.subscriptionId === "string" &&
      typeof entry.subscriptionSessionId === "string" &&
      typeof entry.toolId === "string" &&
      typeof entry.planId === "string"
    );
  });
}
