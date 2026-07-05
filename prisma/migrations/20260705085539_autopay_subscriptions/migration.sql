/*
  Warnings:

  - A unique constraint covering the columns `[cashfreeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cfSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AutopayStatus" AS ENUM ('INITIALIZED', 'BANK_APPROVAL_PENDING', 'ACTIVE', 'ON_HOLD', 'PAUSED', 'COMPLETED', 'CUSTOMER_CANCELLED', 'CUSTOMER_PAUSED', 'EXPIRED', 'LINK_EXPIRED', 'CARD_EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "autopaySessions" JSONB;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "autopayEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autopayStatus" "AutopayStatus",
ADD COLUMN     "cashfreeSubscriptionId" TEXT,
ADD COLUMN     "cfSubscriptionId" TEXT,
ADD COLUMN     "firstChargeAmount" DOUBLE PRECISION,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "recurringAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "RenewalPayment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "billingPeriodStart" TIMESTAMP(3),
    "billingPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenewalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_cashfreeSubscriptionId_key" ON "Subscription"("cashfreeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_cfSubscriptionId_key" ON "Subscription"("cfSubscriptionId");

-- AddForeignKey
ALTER TABLE "RenewalPayment" ADD CONSTRAINT "RenewalPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
