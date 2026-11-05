import { prisma } from "../../config/prisma.js";
import { emitToSite } from "../../lib/socket.js";
import { markWorkerLocationFresh } from
  "./site-safety.stale.js";
import { isPointInPolygon } from "../../utils/point-in-polygon.js";

import type {
    locationReportSchema,
    createZoneSchema,
    createHazardSchema,
    updateHazardSchema,
} from "./site-safety.validation.js";

import type { z } from "zod";

const STALE_AFTER_MS = 15 * 60 * 1000;

type LocationInput = z.infer<typeof locationReportSchema>;
type ZoneInput = z.infer<typeof createZoneSchema>;
type HazardInput = z.infer<typeof createHazardSchema>;
type HazardUpdate = z.infer<typeof updateHazardSchema>;

export async function reportWorkerLocation(
    input: LocationInput,
) {
    const worker = await prisma.worker.findUnique({
        where: { id: input.workerId },
        select: {
            id: true,
            name: true,
            employeeId: true,
            site: true,
        },
    });

    if (!worker) {
        throw new Error("WORKER_NOT_FOUND");
    }

    if (worker.site !== input.site) {
        throw new Error("WORKER_SITE_MISMATCH");
    }

    const zones = await prisma.siteZone.findMany({
        where: { site: input.site },
        select: {
            id: true,
            name: true,
            type: true,
            boundary: true,
        },
    });

    // Prefer a more specific zone over a SAFE zone if polygons overlap.
    const priority = {
        HAZARD: 0,
        RESTRICTED: 1,
        ASSEMBLY: 2,
        SAFE: 3,
    } as const;

    const matchingZones = zones
        .filter((zone) =>
            isPointInPolygon(
                {
                    lat: input.latitude,
                    lng: input.longitude,
                },
                zone.boundary,
            ),
        )
        .sort(
            (a, b) => priority[a.type] - priority[b.type],
        );

    const zone = matchingZones[0];

    const location = await prisma.workerLocation.create({
        data: {
            workerId: worker.id,
            zoneId: zone?.id ?? null,
            latitude: input.latitude,
            longitude: input.longitude,
            accuracyM: input.accuracyM ?? null,
        },
        include: {
            zone: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
    });
    markWorkerLocationFresh(worker.id);
    const payload = {
        worker: {
            id: worker.id,
            name: worker.name,
            employeeId: worker.employeeId,
        },
        location: {
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracyM: location.accuracyM,
            reportedAt: location.reportedAt,
            zone: location.zone,
        },
        stale: false,
    };

    emitToSite(input.site, "worker:location_updated", payload);

    if (location.zone?.type === "HAZARD") {
        emitToSite(input.site, "worker:hazard_zone_entered", payload);
    }

    return payload;
}

export async function getSiteMap(site: string) {
    const [zones, hazards, locations] = await Promise.all([
        prisma.siteZone.findMany({
            where: { site },
            orderBy: { createdAt: "asc" },
            include: {
                hazards: {
                    where: { status: { not: "RESOLVED" } },
                    orderBy: { reportedAt: "desc" },
                },
            },
        }),

        prisma.hazardReport.findMany({
            where: {
                site,
                status: { not: "RESOLVED" },
            },
            orderBy: { reportedAt: "desc" },
        }),

        prisma.workerLocation.findMany({
            where: {
                worker: { site },
            },
            orderBy: { reportedAt: "desc" },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        employeeId: true,
                        sector: true,
                        site: true,
                    },
                },
                zone: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        }),
    ]);

    // Locations are sorted newest-first, so the first per worker is current.
    const seenWorkers = new Set<string>();
    const now = Date.now();

    const workers = locations
        .filter((item) => {
            if (seenWorkers.has(item.workerId)) {
                return false;
            }

            seenWorkers.add(item.workerId);
            return true;
        })
        .map((item) => {
            const stale =
                now - item.reportedAt.getTime() > STALE_AFTER_MS;

            return {
                worker: item.worker,
                location: {
                    id: item.id,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    accuracyM: item.accuracyM,
                    reportedAt: item.reportedAt,
                    zone: item.zone,
                },
                stale,
            };
        });

    return {
        site,
        generatedAt: new Date().toISOString(),
        staleAfterSeconds: STALE_AFTER_MS / 1000,
        zones,
        hazards,
        workers,
        summary: {
            zoneCount: zones.length,
            unresolvedHazards: hazards.length,
            workersReporting: workers.length,
            staleWorkers: workers.filter((worker) => worker.stale).length,
        },
    };
}

export async function createSiteZone(input: ZoneInput) {
    const zone = await prisma.siteZone.create({
        data: {
            name: input.name,
            site: input.site,
            ...(input.description !== undefined && {
                description: input.description,
            }),
            type: input.type,
            boundary: input.boundary,
        },
    });

    emitToSite(input.site, "zone:updated", {
        action: "created",
        zone,
    });

    return zone;
}

export async function createHazard(input: HazardInput) {
    if (input.zoneId) {
        const zone = await prisma.siteZone.findUnique({
            where: { id: input.zoneId },
            select: { id: true, site: true },
        });

        if (!zone || zone.site !== input.site) {
            throw new Error("ZONE_NOT_FOUND");
        }
    }

    const hazard = await prisma.hazardReport.create({
        data: {
            site: input.site,
            zoneId: input.zoneId ?? null,
            title: input.title,
            description: input.description ?? null,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            reportedBy: input.reportedBy ?? null,
        },
    });

    emitToSite(input.site, "hazard:created", hazard);

    return hazard;
}

export async function updateHazard(
    id: string,
    input: HazardUpdate,
) {
    const existing = await prisma.hazardReport.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new Error("HAZARD_NOT_FOUND");
    }

    const hazard = await prisma.hazardReport.update({
        where: { id },
        data: {
            status: input.status,
            resolvedBy:
                input.status === "RESOLVED"
                    ? input.resolvedBy ?? null
                    : null,
            resolvedAt:
                input.status === "RESOLVED"
                    ? new Date()
                    : null,
        },
    });

    emitToSite(existing.site, "hazard:updated", hazard);

    return hazard;
}