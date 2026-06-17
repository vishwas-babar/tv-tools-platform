/*
  Warnings:

  - You are about to drop the column `toolId` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `name` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_toolId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "toolId",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_PlanToTool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlanToTool_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PlanToTool_B_index" ON "_PlanToTool"("B");

-- AddForeignKey
ALTER TABLE "_PlanToTool" ADD CONSTRAINT "_PlanToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanToTool" ADD CONSTRAINT "_PlanToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
