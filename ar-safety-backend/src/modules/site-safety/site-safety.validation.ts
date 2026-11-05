import { z } from "zod";

const coordinateSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

export const locationReportSchema = z.object({
  workerId: z.string().min(1),
  site: z.string().trim().min(1),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  accuracyM: z.number().finite().min(0).optional(),
});

export const createZoneSchema = z.object({
  name: z.string().trim().min(1),
  site: z.string().trim().min(1),
  description: z.string().optional(),
  type: z.enum([
    "SAFE",
    "RESTRICTED",
    "HAZARD",
    "ASSEMBLY",
  ]).default("SAFE"),
  boundary: z.array(coordinateSchema).min(3),
});

export const createHazardSchema = z.object({
  site: z.string().trim().min(1),
  zoneId: z.string().optional(),
  title: z.string().trim().min(1),
  description: z.string().optional(),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
  reportedBy: z.string().optional(),
}).refine(
  (data) =>
    (data.latitude === undefined) ===
    (data.longitude === undefined),
  {
    message: "Latitude and longitude must be supplied together",
    path: ["latitude"],
  },
);

export const updateHazardSchema = z.object({
  status: z.enum([
    "OPEN",
    "INVESTIGATING",
    "RESOLVED",
  ]),
  resolvedBy: z.string().optional(),
});