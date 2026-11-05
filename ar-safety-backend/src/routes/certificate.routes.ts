import { Router } from "express";
import {
  verifyCertificate,generateCertificateQR,generateCertificatePDF
} from "../controllers/certificate.controller.js";

const router = Router();

router.get(
  "/:certificateNumber/verify",
  verifyCertificate
);

router.get(
  "/:certificateNumber/qr",
  generateCertificateQR
);
router.get(
    "/:certificateNumber/pdf",
    generateCertificatePDF
);

export default router;