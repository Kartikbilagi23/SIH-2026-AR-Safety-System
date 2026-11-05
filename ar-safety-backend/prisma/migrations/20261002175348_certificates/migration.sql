/*
  Warnings:

  - You are about to drop the column `certificateNo` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `valid` on the `Certificate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[certificateNumber]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificateNumber` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Certificate_certificateNo_key";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "certificateNo",
DROP COLUMN "score",
DROP COLUMN "valid",
ADD COLUMN     "certificateNumber" TEXT NOT NULL,
ADD COLUMN     "moduleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "Certificate_workerId_idx" ON "Certificate"("workerId");

-- CreateIndex
CREATE INDEX "Certificate_moduleId_idx" ON "Certificate"("moduleId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TrainingModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
