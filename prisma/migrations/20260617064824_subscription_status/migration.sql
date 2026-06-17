-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_ACCESS', 'ACTIVE');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING_ACCESS',
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "startDate" DROP DEFAULT,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
