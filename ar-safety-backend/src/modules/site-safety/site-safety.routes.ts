import { Router } from "express";

import {
  locationReportSchema,
  createZoneSchema,
  createHazardSchema,
  updateHazardSchema,
} from "./site-safety.validation.js";

import {
  reportWorkerLocation,
  getSiteMap,
  createSiteZone,
  createHazard,
  updateHazard,
} from "./site-safety.service.js";

const router = Router();

function handleError(
  error: unknown,
  res: import("express").Response,
) {
  if (error instanceof Error) {
    const knownErrors: Record<
      string,
      { status: number; message: string }
    > = {
      WORKER_NOT_FOUND: {
        status: 404,
        message: "Worker not found",
      },
      WORKER_SITE_MISMATCH: {
        status: 403,
        message: "Worker does not belong to this site",
      },
      ZONE_NOT_FOUND: {
        status: 404,
        message: "Zone not found for this site",
      },
      HAZARD_NOT_FOUND: {
        status: 404,
        message: "Hazard not found",
      },
    };

    const known = knownErrors[error.message];

    if (known) {
      return res.status(known.status).json({
        success: false,
        message: known.message,
      });
    }
  }

  console.error("Site safety error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

// GET /api/site-safety/map?site=Dhanbad%20Mine%20A
router.get("/map", async (req, res) => {
  const site =
    typeof req.query.site === "string"
      ? req.query.site.trim()
      : "";

  if (!site) {
    return res.status(400).json({
      success: false,
      message: "site query parameter is required",
    });
  }

  try {
    const data = await getSiteMap(site);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// POST /api/site-safety/locations
router.post("/locations", async (req, res) => {
  const parsed = locationReportSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid location report",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const data = await reportWorkerLocation(parsed.data);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// GET /api/site-safety/zones?site=...
router.get("/zones", async (req, res) => {
  const site =
    typeof req.query.site === "string"
      ? req.query.site.trim()
      : "";

  if (!site) {
    return res.status(400).json({
      success: false,
      message: "site query parameter is required",
    });
  }

  try {
    const { zones } = await getSiteMap(site);

    return res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// POST /api/site-safety/zones
router.post("/zones", async (req, res) => {
  const parsed = createZoneSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid zone data",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const data = await createSiteZone(parsed.data);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// POST /api/site-safety/hazards
router.post("/hazards", async (req, res) => {
  const parsed = createHazardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid hazard data",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const data = await createHazard(parsed.data);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// PATCH /api/site-safety/hazards/:id
router.patch("/hazards/:id", async (req, res) => {
  const parsed = updateHazardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid hazard update",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const data = await updateHazard(
      req.params.id!,
      parsed.data,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

export default router;