import { prisma } from "@/lib/prisma";
import { formatDuration, formatPrice } from "@/lib/format";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { SITE_NAME } from "@/lib/site";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatToolList(
  items: Array<{
    tool: { name: string };
    plan: { name: string; durationDays: number };
    price: number;
  }>
): { text: string; html: string } {
  const text = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.tool.name} — ${item.plan.name} (${formatDuration(item.plan.durationDays)}) — ${formatPrice(item.price)}`
    )
    .join("\n");

  const html = `<ul>${items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.tool.name)}</strong> — ${escapeHtml(item.plan.name)} (${escapeHtml(formatDuration(item.plan.durationDays))}) — ${escapeHtml(formatPrice(item.price))}</li>`
    )
    .join("")}</ul>`;

  return { text, html };
}

export async function sendPurchaseEmails(orderId: string) {
  if (!isEmailConfigured()) {
    console.warn(
      "Purchase emails skipped: configure SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM, ADMIN_EMAIL, and SUPPORT_EMAIL"
    );
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          tradingViewId: true,
        },
      },
      items: {
        include: {
          tool: { select: { name: true } },
          plan: { select: { name: true, durationDays: true } },
        },
      },
    },
  });

  if (!order || order.status !== "PAID") return;

  const adminEmail = process.env.ADMIN_EMAIL!;
  const supportEmail = process.env.SUPPORT_EMAIL!;
  const toolList = formatToolList(order.items);
  const orderRef = order.cashfreeOrderId;
  const buyerName = order.user.name;
  const buyerEmail = order.user.email;

  const adminText = [
    `A user has completed a purchase on ${SITE_NAME}.`,
    "",
    "Please grant access to the following tools:",
    toolList.text,
    "",
    "Buyer details:",
    `- Name: ${buyerName}`,
    `- Email: ${buyerEmail}`,
    `- Phone: ${order.user.phone}`,
    `- TradingView ID: ${order.user.tradingViewId || "Not provided"}`,
    "",
    `Order ID: ${orderRef}`,
    `Total amount: ${formatPrice(order.totalAmount)}`,
  ].join("\n");

  const adminHtml = `
    <p>A user has completed a purchase on ${escapeHtml(SITE_NAME)}.</p>
    <p><strong>Please grant access to the following tools:</strong></p>
    ${toolList.html}
    <p><strong>Buyer details:</strong></p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(buyerName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(buyerEmail)}</li>
      <li><strong>Phone:</strong> ${escapeHtml(order.user.phone)}</li>
      <li><strong>TradingView ID:</strong> ${escapeHtml(order.user.tradingViewId || "Not provided")}</li>
    </ul>
    <p><strong>Order ID:</strong> ${escapeHtml(orderRef)}</p>
    <p><strong>Total amount:</strong> ${escapeHtml(formatPrice(order.totalAmount))}</p>
  `;

  const buyerText = [
    `Hi ${buyerName},`,
    "",
    `Thank you for your purchase on ${SITE_NAME}.`,
    "",
    "Your purchased tools:",
    toolList.text,
    "",
    "You will receive access to your purchased tools within the next 24 hours.",
    "",
    `For any queries, please contact us at ${supportEmail}.`,
    "",
    `Order ID: ${orderRef}`,
    `Total amount: ${formatPrice(order.totalAmount)}`,
  ].join("\n");

  const buyerHtml = `
    <p>Hi ${escapeHtml(buyerName)},</p>
    <p>Thank you for your purchase on ${escapeHtml(SITE_NAME)}.</p>
    <p><strong>Your purchased tools:</strong></p>
    ${toolList.html}
    <p>You will receive access to your purchased tools within the next 24 hours.</p>
    <p>For any queries, please contact us at <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
    <p><strong>Order ID:</strong> ${escapeHtml(orderRef)}</p>
    <p><strong>Total amount:</strong> ${escapeHtml(formatPrice(order.totalAmount))}</p>
  `;

  await Promise.all([
    sendEmail({
      to: adminEmail,
      subject: `New purchase — grant access for ${buyerName}`,
      text: adminText,
      html: adminHtml,
    }),
    sendEmail({
      to: buyerEmail,
      subject: "Thank you for your purchase",
      text: buyerText,
      html: buyerHtml,
    }),
  ]);
}
