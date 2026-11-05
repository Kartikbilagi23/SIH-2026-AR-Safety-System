import { Router } from "express";

import {
  getReportOverviewController,
  getTrainingStatusReportController,
  getModulePerformanceReportController,
  getTrainingTrendReportController,
  getRecentTrainingActivityController,
  exportReportController
} from "../controllers/report.controller.js";

const router = Router();

router.get(
  "/overview",
  getReportOverviewController
);

router.get(
  "/status",
  getTrainingStatusReportController
);

router.get(
  "/modules",
  getModulePerformanceReportController
);

router.get(
  "/trend",
  getTrainingTrendReportController
);

router.get(
  "/activity",
  getRecentTrainingActivityController
);

router.get(
  "/export",
  exportReportController
);

export default router;