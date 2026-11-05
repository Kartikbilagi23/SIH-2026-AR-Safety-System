
import { prisma } from "../../config/prisma.js";
import { emitToSite } from "../../lib/socket.js";

const STALE_AFTER_MS = 15 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

// Prevent repeating the same alert every minute.
const staleWorkersNotified = new Set<string>();

export function markWorkerLocationFresh(workerId: string) {
  staleWorkersNotified.delete(workerId);
}

export async function checkStaleWorkerLocations() {
  const now = Date.now();

  const workers = await prisma.worker.findMany({
    where: {
      site: { not: null },
    },
    select: {
      id: true,
      name: true,
      employeeId: true,
      site: true,
      locations: {
        orderBy: { reportedAt: "desc" },
        take: 1,
        select: {
          id: true,
          latitude: true,
          longitude: true,
          reportedAt: true,
          zoneId: true,
        },
      },
    },
  });

  const currentlyStale = new Set<string>();

  for (const worker of workers) {
    const latest = worker.locations[0];

    // No location reported yet: there is no last-known location to mark stale.
    if (!latest || !worker.site) {
      continue;
    }

    const ageMs = now - latest.reportedAt.getTime();

    if (ageMs <= STALE_AFTER_MS) {
      continue;
    }

    currentlyStale.add(worker.id);

    if (staleWorkersNotified.has(worker.id)) {
      continue;
    }

    staleWorkersNotified.add(worker.id);

    emitToSite(worker.site, "worker:location_stale", {
      worker: {
        id: worker.id,
        name: worker.name,
        employeeId: worker.employeeId,
      },
      lastLocation: {
        id: latest.id,
        latitude: latest.latitude,
        longitude: latest.longitude,
        zoneId: latest.zoneId,
        reportedAt: latest.reportedAt,
      },
      staleSince: new Date(
        latest.reportedAt.getTime() + STALE_AFTER_MS,
      ).toISOString(),
      detectedAt: new Date(now).toISOString(),
      ageSeconds: Math.floor(ageMs / 1000),
    });
  }

  // Re-arm notifications when a worker is no longer stale.
  for (const workerId of staleWorkersNotified) {
    if (!currentlyStale.has(workerId)) {
      staleWorkersNotified.delete(workerId);
    }
  }
}

export function startStaleLocationMonitor() {
  const runCheck = () => {
    void checkStaleWorkerLocations().catch((error: unknown) => {
      console.error("Stale location monitor failed:", error);
    });
  };

  // Check immediately at startup, then every minute.
  runCheck();

  const timer = setInterval(runCheck, CHECK_INTERVAL_MS);
  timer.unref();

  console.log("Stale location monitor started (60-second interval)");
}
