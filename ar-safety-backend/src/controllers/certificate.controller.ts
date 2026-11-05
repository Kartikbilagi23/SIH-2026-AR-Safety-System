import { type Request, type Response } from "express";
import { prisma } from "../config/prisma.js";
import  QRCode  from "qrcode";
import { generateCertificatePdf } from "../utils/certificatePdf.js";

export const verifyCertificate = async (
  req: Request,
  res: Response
) => {
  try {
    const { certificateNumber } = req.params;

    if (
      !certificateNumber ||
      Array.isArray(certificateNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate number",
      });
    }

    const certificate =
      await prisma.certificate.findUnique({
        where: {
          certificateNumber,
        },
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
          module: {
            include: {
              translations: true,
            },
          },
          session: {
            select: {
              score: true,
              passed: true,
              completedAt: true,
            },
          },
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
        data: {
          valid: false,
        },
      });
    }

    if (!certificate.session.passed) {
      return res.status(400).json({
        success: false,
        message: "Certificate is not valid",
        data: {
          valid: false,
        },
      });
    }

    const englishTranslation =
      certificate.module.translations.find(
        (translation) => translation.language === "EN"
      );

    return res.status(200).json({
      success: true,
      message: "Certificate is valid",
      data: {
        valid: true,

        certificate: {
          certificateNumber:
            certificate.certificateNumber,

          issuedAt: certificate.issuedAt,

          worker: certificate.worker,

          module: {
            id: certificate.module.id,
            category: certificate.module.category,
            title:
              englishTranslation?.title ??
              certificate.module.category,
          },

          assessment: {
            score: certificate.session.score,
            passed: certificate.session.passed,
            completedAt:
              certificate.session.completedAt,
          },
        },
      },
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const generateCertificateQR = async (
  req: Request,
  res: Response
) => {
  try {
    const { certificateNumber } = req.params;

    if (
      !certificateNumber ||
      Array.isArray(certificateNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate number",
      });
    }

    const certificate =
      await prisma.certificate.findUnique({
        where: {
          certificateNumber,
        },
        select: {
          certificateNumber: true,
          session: {
            select: {
              passed: true,
            },
          },
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    if (!certificate.session.passed) {
      return res.status(400).json({
        success: false,
        message: "Certificate is not valid",
      });
    }

    const publicAppUrl =
      process.env.PUBLIC_APP_URL;

    if (!publicAppUrl) {
      return res.status(500).json({
        success: false,
        message: "Public application URL is not configured",
      });
    }

    const verificationUrl =
      `${publicAppUrl}/verify/${encodeURIComponent(
        certificate.certificateNumber
      )}`;

    const qrCode = await QRCode.toDataURL(
      verificationUrl
    );

    return res.status(200).json({
      success: true,
      data: {
        certificateNumber:
          certificate.certificateNumber,
        verificationUrl,
        qrCode,
      },
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const generateCertificatePDF = async (
    req: Request,
    res: Response
) => {
    try {
        const { certificateNumber } = req.params;

        if (
            !certificateNumber ||
            Array.isArray(certificateNumber)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid certificate number",
            });
        }

        const certificate =
            await prisma.certificate.findUnique({
                where: {
                    certificateNumber,
                },
                include: {
                    worker: {
                        select: {
                            name: true,
                            employeeId: true,
                            sector: true,
                            site: true,
                        },
                    },

                    module: {
                        include: {
                            translations: true,
                        },
                    },

                    session: {
                        select: {
                            score: true,
                            passed: true,
                            completedAt: true,
                        },
                    },
                },
            });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        }

        if (!certificate.session.passed) {
            return res.status(400).json({
                success: false,
                message: "Certificate is not valid",
            });
        }

        const englishTranslation =
            certificate.module.translations.find(
                (translation) =>
                    translation.language === "EN"
            );

        const pdfBuffer =
            await generateCertificatePdf({
                certificateNumber:
                    certificate.certificateNumber,

                issuedAt: certificate.issuedAt,

                worker: {
                    name: certificate.worker.name,
                    employeeId:
                        certificate.worker.employeeId,
                    sector: certificate.worker.sector,
                    site: certificate.worker.site,
                },

                module: {
                    category:
                        certificate.module.category,

                    title:
                        englishTranslation?.title ??
                        certificate.module.category,
                },

                assessment: {
                    score:
                        certificate.session.score,

                    passed:
                        certificate.session.passed,

                    completedAt:
                        certificate.session.completedAt,
                },
            });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename="certificate-${certificate.certificateNumber}.pdf"`
        );

        res.setHeader(
            "Content-Length",
            pdfBuffer.length
        );

        return res.status(200).send(pdfBuffer);
    } catch (error: unknown) {
        console.error(
            "Generate certificate PDF error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate certificate PDF",
        });
    }
};