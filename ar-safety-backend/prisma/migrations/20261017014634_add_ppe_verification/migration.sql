-- CreateEnum
CREATE TYPE "PPEDetectionStatus" AS ENUM ('DETECTED', 'NOT_DETECTED', 'UNABLE_TO_VERIFY');

-- CreateTable
CREATE TABLE "PPEVerification" (
    "id" TEXT NOT NULL,
    "workerId" TEXT,
    "zoneId" TEXT,
    "site" TEXT NOT NULL,
    "cameraId" TEXT,
    "helmetStatus" "PPEDetectionStatus" NOT NULL DEFAULT 'UNABLE_TO_VERIFY',
    "vestStatus" "PPEDetectionStatus" NOT NULL DEFAULT 'UNABLE_TO_VERIFY',
    "helmetConfidence" DOUBLE PRECISION,
    "vestConfidence" DOUBLE PRECISION,
    "snapshotUrl" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PPEVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PPEVerification_workerId_verifiedAt_idx" ON "PPEVerification"("workerId", "verifiedAt");

-- CreateIndex
CREATE INDEX "PPEVerification_zoneId_verifiedAt_idx" ON "PPEVerification"("zoneId", "verifiedAt");

-- CreateIndex
CREATE INDEX "PPEVerification_site_verifiedAt_idx" ON "PPEVerification"("site", "verifiedAt");

-- AddForeignKey
ALTER TABLE "PPEVerification" ADD CONSTRAINT "PPEVerification_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEVerification" ADD CONSTRAINT "PPEVerification_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "SiteZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
