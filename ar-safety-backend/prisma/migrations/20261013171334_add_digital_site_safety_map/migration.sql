-- CreateEnum
CREATE TYPE "SiteZoneType" AS ENUM ('SAFE', 'RESTRICTED', 'HAZARD', 'ASSEMBLY');

-- CreateEnum
CREATE TYPE "HazardStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- CreateTable
CREATE TABLE "SiteZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "description" TEXT,
    "type" "SiteZoneType" NOT NULL DEFAULT 'SAFE',
    "boundary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerLocation" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "zoneId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracyM" DOUBLE PRECISION,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HazardReport" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT,
    "site" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "HazardStatus" NOT NULL DEFAULT 'OPEN',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reportedBy" TEXT,
    "resolvedBy" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "HazardReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteZone_site_idx" ON "SiteZone"("site");

-- CreateIndex
CREATE INDEX "SiteZone_site_type_idx" ON "SiteZone"("site", "type");

-- CreateIndex
CREATE INDEX "WorkerLocation_workerId_reportedAt_idx" ON "WorkerLocation"("workerId", "reportedAt");

-- CreateIndex
CREATE INDEX "WorkerLocation_zoneId_reportedAt_idx" ON "WorkerLocation"("zoneId", "reportedAt");

-- CreateIndex
CREATE INDEX "WorkerLocation_reportedAt_idx" ON "WorkerLocation"("reportedAt");

-- CreateIndex
CREATE INDEX "HazardReport_site_status_idx" ON "HazardReport"("site", "status");

-- CreateIndex
CREATE INDEX "HazardReport_zoneId_status_idx" ON "HazardReport"("zoneId", "status");

-- CreateIndex
CREATE INDEX "HazardReport_reportedAt_idx" ON "HazardReport"("reportedAt");

-- AddForeignKey
ALTER TABLE "WorkerLocation" ADD CONSTRAINT "WorkerLocation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerLocation" ADD CONSTRAINT "WorkerLocation_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "SiteZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HazardReport" ADD CONSTRAINT "HazardReport_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "SiteZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
