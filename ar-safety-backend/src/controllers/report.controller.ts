import type { Request, Response } from "express";
import {
  getReportOverview,
  getTrainingStatusReport,
  getModulePerformanceReport,
  getTrainingTrendReport,
  getRecentTrainingActivity
} from "../services/report.service.js";
import { generateReportPdf } from "../services/reportPdf.service.js";

export const getReportOverviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await getReportOverview();

    return res.status(200).json(report);
  } catch (error) {
    console.error("Report overview error:", error);

    return res.status(500).json({
      message: "Failed to generate report",
    });
  }
};
export const getTrainingStatusReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await getTrainingStatusReport();

    return res.status(200).json(report);
  } catch (error) {
    console.error("Training status report error:", error);

    return res.status(500).json({
      message: "Failed to generate training status report",
    });
  }
};
export const getModulePerformanceReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await getModulePerformanceReport();

    return res.status(200).json(report);
  } catch (error) {
    console.error("Module performance report error:", error);

    return res.status(500).json({
      message: "Failed to generate module performance report",
    });
  }
};
export const getTrainingTrendReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await getTrainingTrendReport();

    return res.status(200).json(report);
  } catch (error) {
    console.error("Training trend report error:", error);

    return res.status(500).json({
      message: "Failed to generate training trend report",
    });
  }
};
export const getRecentTrainingActivityController = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await getRecentTrainingActivity();

    return res.status(200).json(report);
  } catch (error) {
    console.error("Recent training activity error:", error);

    return res.status(500).json({
      message: "Failed to generate recent training activity report",
    });
  }
};
export const exportReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const pdf = await generateReportPdf();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="SurakshaSetu-Training-Report-${new Date()
        .toISOString()
        .split("T")[0]}.pdf"`
    );

    return res.status(200).send(pdf);
  } catch (error) {
    console.error("Report PDF generation error:", error);

    return res.status(500).json({
      message: "Failed to generate report PDF",
    });
  }
};