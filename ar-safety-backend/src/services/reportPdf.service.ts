import PDFDocument from "pdfkit";
import { getReportOverview } from "./report.service.js";
import { getTrainingStatusReport } from "./report.service.js";
import { getModulePerformanceReport } from "./report.service.js";
import { getTrainingTrendReport } from "./report.service.js";
import { getRecentTrainingActivity } from "./report.service.js";

export const generateReportPdf = async () => {
    const [
        overview,
        status,
        modules,
        trend,
        activity,
    ] = await Promise.all([
        getReportOverview(),
        getTrainingStatusReport(),
        getModulePerformanceReport(),
        getTrainingTrendReport(),
        getRecentTrainingActivity(),
    ]);

    const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
    });

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);
    });

    /*
     * HEADER
     */

    doc
        .fontSize(10)
        .fillColor("#475569")
        .text("GOVERNMENT SAFETY TRAINING PORTAL", {
            align: "center",
        });

    doc
        .moveDown(0.3)
        .fontSize(18)
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .text("SURAKSHASETU", {
            align: "center",
        });

    doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#475569")
        .text("Safety Training & Compliance Management System", {
            align: "center",
        });

    doc.moveDown(0.8);

    doc
        .moveTo(45, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#164e86")
        .lineWidth(2)
        .stroke();

    doc.moveDown(1);

    /*
     * REPORT TITLE
     */

    doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .text("TRAINING PERFORMANCE REPORT", {
            align: "center",
        });

    doc.moveDown(0.4);

    doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(
            `Generated on: ${new Date().toLocaleString("en-IN")}`,
            {
                align: "center",
            }
        );

    doc.moveDown(1.2);

    /*
     * REPORT INFORMATION
     */

    drawSectionTitle(doc, "1. REPORT INFORMATION");

    drawInfoRow(
        doc,
        "Report Number",
        `SS/RPT/${new Date().getFullYear()}/001`
    );

    drawInfoRow(
        doc,
        "Reporting Period",
        "Last 7 Days"
    );

    drawInfoRow(
        doc,
        "System",
        "SurakshaSetu Safety Training Portal"
    );

    doc.moveDown(1);

    /*
     * EXECUTIVE SUMMARY
     */

    drawSectionTitle(doc, "2. EXECUTIVE SUMMARY");

    const summary = overview.summary;

    const summaryRows = [
        ["Total Workers", String(summary.totalWorkers)],
        ["Training Sessions", String(summary.totalSessions)],
        ["Completed Sessions", String(summary.completedSessions)],
        ["Pass Rate", `${summary.passRate}%`],
        ["Average Score", `${summary.averageScore}%`],
        ["Certificates Issued", String(summary.certificatesIssued)],
    ];

    drawTable(
        doc,
        ["Metric", "Value"],
        summaryRows,
        [330, 120]
    );

    doc.moveDown(1);

    /*
     * TRAINING STATUS
     */

    drawSectionTitle(doc, "3. TRAINING STATUS");

    const statusRows = status.statusDistribution.map(
        (item) => [
            formatStatus(item.status),
            String(item.count),
        ]
    );

    drawTable(
        doc,
        ["Training Status", "Sessions"],
        statusRows,
        [330, 120]
    );

    doc.moveDown(1);

    /*
     * MODULE PERFORMANCE
     */

    drawSectionTitle(doc, "4. MODULE PERFORMANCE");

    const moduleRows = modules.modules.map((module) => [
        module.moduleName,
        module.category,
        String(module.attempts),
        String(module.completed),
        String(module.passed),
        String(module.failed),
        `${module.averageScore}%`,
    ]);

    drawTable(
        doc,
        [
            "Module",
            "Category",
            "Attempts",
            "Completed",
            "Passed",
            "Failed",
            "Avg Score",
        ],
        moduleRows,
        [150, 75, 50, 60, 45, 45, 55]
    );

    /*
     * TREND
     */

    doc.addPage();

    drawSectionTitle(doc, "5. TRAINING ACTIVITY — LAST 7 DAYS");

    const trendRows = trend.trend.map((item) => [
        formatDate(item.date),
        String(item.started),
        String(item.completed),
    ]);

    drawTable(
        doc,
        ["Date", "Started", "Completed"],
        trendRows,
        [220, 120, 120]
    );

    doc.moveDown(1);

    /*
     * RECENT ACTIVITY
     */

    drawSectionTitle(doc, "6. RECENT TRAINING ACTIVITY");

    const activityRows = activity.activity.map((item) => [
        item.workerName,
        item.moduleName,
        `#${item.attemptNumber}`,
        item.score !== null ? `${item.score}%` : "-",
        formatStatus(item.status),
        formatDate(item.startedAt),
    ]);

    drawTable(
        doc,
        [
            "Worker",
            "Module",
            "Attempt",
            "Score",
            "Status",
            "Date",
        ],
        activityRows,
        [110, 130, 55, 55, 75, 75]
    );

    doc.moveDown(2);

    /*
     * CERTIFICATION / AUTHORIZATION
     */

    drawSectionTitle(doc, "7. AUTHORIZATION");

    doc
        .fontSize(9)
        .fillColor("#475569")
        .text(
            "This report has been generated electronically by the " +
            "SurakshaSetu Safety Training Portal."
        );

    doc.moveDown(2);

    doc
        .fontSize(9)
        .fillColor("#334155")
        .text("Authorized Officer: ______________________________");

    doc.moveDown(0.7);

    doc.text("Date: ____________________");

    /*
     * FOOTER
     */

    const range = doc.bufferedPageRange();

    for (
        let i = range.start;
        i < range.start + range.count;
        i++
    ) {
        doc.switchToPage(i);

        doc
            .fontSize(8)
            .fillColor("#94a3b8")
            .text(
                "SurakshaSetu | Official Training Performance Report",
                45,
                785,
                {
                    width: 360,
                    align: "left",
                }
            );

        doc.text(
            `Page ${i + 1} of ${range.count}`,
            430,
            785,
            {
                width: 120,
                align: "right",
            }
        );
    }

    doc.end();

    return pdfBufferPromise;
};

/* =========================
   HELPERS
========================= */

const drawSectionTitle = (
    doc: PDFKit.PDFDocument,
    title: string
) => {
    doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#164e86")
        .text(title);

    doc.moveDown(0.4);
};

const drawInfoRow = (
    doc: PDFKit.PDFDocument,
    label: string,
    value: string
) => {
    doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#334155")
        .text(`${label}: `, {
            continued: true,
        })
        .font("Helvetica")
        .fillColor("#475569")
        .text(value);

    doc.moveDown(0.25);
};

const drawTable = (
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    widths: number[]
) => {
    const startX = 45;
    let y = doc.y;

    const rowHeight = 24;

    // Header
    doc
        .rect(
            startX,
            y,
            widths.reduce((sum, width) => sum + width, 0),
            rowHeight
        )
        .fill("#eaf1f8");

    let x = startX;

    headers.forEach((header, index) => {
        const width = widths[index];

        if (width === undefined) return;

        doc
            .fontSize(7.5)
            .font("Helvetica-Bold")
            .fillColor("#164e86")
            .text(header, x + 5, y + 8, {
                width: width - 10,
                align: "left",
            });

        x += width;
    });

    y += rowHeight;

    // Rows
    rows.forEach((row) => {
        x = startX;

        doc
            .rect(
                startX,
                y,
                widths.reduce((sum, width) => sum + width, 0),
                rowHeight
            )
            .fill("#ffffff");

        doc
            .moveTo(startX, y + rowHeight)
            .lineTo(
                startX + widths.reduce((sum, width) => sum + width, 0),
                y + rowHeight
            )
            .strokeColor("#e2e8f0")
            .lineWidth(0.5)
            .stroke();

        row.forEach((value, index) => {
            const width = widths[index];
            if (width === undefined) {
                return;
            }
            doc
                .fontSize(7.5)
                .font("Helvetica")
                .fillColor("#475569")
                .text(value, x + 5, y + 8, {
                    width: width - 10,
                    height: rowHeight - 4,
                    ellipsis: true,
                });

            x += width;
        });

        y += rowHeight;
    });

    doc.y = y + 10;
};

const formatStatus = (status: string) => {
    switch (status) {
        case "COMPLETED":
            return "Completed";

        case "IN_PROGRESS":
            return "In Progress";

        case "FAILED":
            return "Failed";

        default:
            return status;
    }
};

const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};