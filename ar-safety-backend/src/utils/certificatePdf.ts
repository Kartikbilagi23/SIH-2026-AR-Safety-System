import PDFDocument from "pdfkit";
import { generateCertificateQr } from "./certificateQr.js";
import path from "node:path";
import sharp from "sharp";

await sharp("assets/embel.svg")
    .png()
    .toFile("assets/emblem.png");



interface CertificatePdfData {
  certificateNumber: string;
  issuedAt: Date;

  worker: {
    name: string;
    employeeId: string;
    sector: string | null;
    site: string | null;
  };

  module: {
    category: string;
    title: string;
  };

  assessment: {
    score: number | null;
    passed: boolean;
    completedAt: Date | null;
  };
}

export const generateCertificatePdf = async (
  data: CertificatePdfData
): Promise<Buffer> => {
  const { qrCode } =
    await generateCertificateQr(
      data.certificateNumber
    );

  // =========================
  // Assets
  // =========================

  const logoPath = path.join(
    process.cwd(),
    "assets",
    "logo.png"
  );

  const emblemPath = path.join(
    process.cwd(),
    "assets",
    "emblem.png"
  );

  // =========================
  // PDF
  // =========================

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    // =========================
    // Colors
    // =========================

    const navy = "#173B73";
    const orange = "#C95A0A";
    const dark = "#1E293B";
    const muted = "#64748B";
    const light = "#F8FAFC";
    const border = "#CBD5E1";
    const green = "#15803D";

    // =========================
    // Outer Border
    // =========================

    doc
      .lineWidth(2.5)
      .strokeColor(navy)
      .rect(28, 28, 539, 785)
      .stroke();

    // Inner border

    doc
      .lineWidth(0.8)
      .strokeColor("#CBD5E1")
      .rect(38, 38, 519, 765)
      .stroke();

    // =========================
    // Header
    // =========================

    doc.image(
      logoPath,
      55,
      52,
      {
        fit: [205, 75],
      }
    );

    doc.image(
      emblemPath,
      505,
      48,
      {
        fit: [38, 60],
      }
    );

    // Header divider

    doc
      .lineWidth(1)
      .strokeColor(border)
      .moveTo(55, 135)
      .lineTo(540, 135)
      .stroke();

    // =========================
    // Certificate Heading
    // =========================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(25)
      .text(
        "CERTIFICATE OF COMPLETION",
        55,
        165,
        {
          width: 485,
          align: "center",
        }
      );

    doc
      .fillColor(orange)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        "SAFETY TRAINING PROGRAM",
        55,
        198,
        {
          width: 485,
          align: "center",
          characterSpacing: 1.5,
        }
      );

    // Small divider

    doc
      .lineWidth(1.5)
      .strokeColor(orange)
      .moveTo(225, 220)
      .lineTo(370, 220)
      .stroke();

    // =========================
    // Certification Text
    // =========================

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(13)
      .text(
        "This is to certify that",
        55,
        245,
        {
          width: 485,
          align: "center",
        }
      );

    // =========================
    // Worker Name
    // =========================

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(27)
      .text(
        data.worker.name,
        55,
        270,
        {
          width: 485,
          align: "center",
        }
      );

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(10.5)
      .text(
        `Employee ID: ${data.worker.employeeId}`,
        55,
        305,
        {
          width: 485,
          align: "center",
        }
      );

    // =========================
    // Completion Text
    // =========================

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(13)
      .text(
        "has successfully completed the safety training",
        55,
        340,
        {
          width: 485,
          align: "center",
        }
      );

    // =========================
    // Training Title
    // =========================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(19)
      .text(
        data.module.title,
        80,
        370,
        {
          width: 435,
          align: "center",
        }
      );

    // Category

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(10.5)
      .text(
        `Category: ${data.module.category}`,
        55,
        405,
        {
          width: 485,
          align: "center",
        }
      );

    // =========================
    // Score Box
    // =========================

    const score =
      data.assessment.score !== null
        ? `${data.assessment.score}%`
        : "N/A";

    doc
      .roundedRect(205, 435, 185, 62, 8)
      .fillColor(light)
      .fill();

    doc
      .lineWidth(1)
      .strokeColor(border)
      .roundedRect(205, 435, 185, 62, 8)
      .stroke();

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(9)
      .text(
        "ASSESSMENT SCORE",
        205,
        447,
        {
          width: 185,
          align: "center",
        }
      );

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(
        score,
        205,
        463,
        {
          width: 185,
          align: "center",
        }
      );

    // =========================
    // Passed Status
    // =========================

    doc
      .fillColor(green)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        data.assessment.passed
          ? "✓ TRAINING PASSED"
          : "TRAINING NOT PASSED",
        55,
        515,
        {
          width: 485,
          align: "center",
        }
      );

    // =========================
    // Certificate Details
    // =========================

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(9.5)
      .text(
        "CERTIFICATE NUMBER",
        65,
        565
      );

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .text(
        data.certificateNumber,
        65,
        580
      );

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(9.5)
      .text(
        "ISSUED ON",
        65,
        608
      );

    doc
      .fillColor(dark)
      .font("Helvetica")
      .fontSize(10.5)
      .text(
        data.issuedAt.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),
        65,
        623
      );

    // =========================
    // QR Code
    // =========================

    doc.image(
      qrCode,
      435,
      555,
      {
        width: 85,
        height: 85,
      }
    );

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Scan to verify",
        420,
        645,
        {
          width: 115,
          align: "center",
        }
      );

    // =========================
    // Footer Divider
    // =========================

    doc
      .lineWidth(1)
      .strokeColor(border)
      .moveTo(55, 675)
      .lineTo(540, 675)
      .stroke();

    // =========================
    // Footer
    // =========================

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        "SurakshaSetu",
        65,
        700
      );

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Safety Training & Certification Platform",
        65,
        715
      );

    // Signature

    doc
      .moveTo(390, 715)
      .lineTo(515, 715)
      .strokeColor(border)
      .stroke();

    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Authorized Signatory",
        390,
        722,
        {
          width: 125,
          align: "center",
        }
      );

    // Verification note

    doc
      .fillColor("#94A3B8")
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        "This certificate is digitally verifiable using the QR code provided above.",
        65,
        760,
        {
          width: 450,
          align: "center",
        }
      );

    doc.end();
  });
};