
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCertificateQR,
    verifyCertificate,
    type Certificate,
    getCertificatePDF,
} from "../../services/certificateService";

import { useLanguage } from "../../context/LanguageContext";

const AdminCertificateDetails = () => {
    const { certificateNumber } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const [certificate, setCertificate] =
        useState<Certificate | null>(null);

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCertificate = async () => {
            if (!certificateNumber) {
                setError("certificateInvalidNumber");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [certificateResponse, qrResponse] =
                    await Promise.all([
                        verifyCertificate(certificateNumber),
                        getCertificateQR(certificateNumber),
                    ]);

                if (!certificateResponse.data.valid) {
                    setError("certificateNotValid");
                    return;
                }

                setCertificate(
                    certificateResponse.data.certificate
                );

                setQrCode(qrResponse.data.qrCode);
            } catch (error: unknown) {
                console.error(error);
                setError("certificateLoadFailed");
            } finally {
                setLoading(false);
            }
        };

        loadCertificate();
    }, [certificateNumber]);

    const getTranslatedError = (errorKey: string) => {
        switch (errorKey) {
            case "certificateInvalidNumber":
                return t("certificateInvalidNumber");
            case "certificateNotValid":
                return t("certificateNotValid");
            case "certificateLoadFailed":
                return t("certificateLoadFailed");
            default:
                return t("certificateNotFound");
        }
    };

    const dateLocale = language === "hi" ? "hi-IN" : "en-IN";

    const formattedIssueDate = certificate
        ? new Date(certificate.issuedAt).toLocaleDateString(
              dateLocale,
              {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              }
          )
        : "";

    if (loading) {
        return (
            <div className="certificate-page">
                <div className="certificate-state">
                    {t("certificateLoading")}
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="certificate-page">
                <div className="certificate-state error">
                    {getTranslatedError(
                        error ?? "certificateNotFound"
                    )}
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin/certificates")}
                >
                    {t("backToCertificates")}
                </button>
            </div>
        );
    }

    return (
        <div className="certificate-page">
            <div className="certificate-page-header">
                <div>
                    <p className="page-eyebrow">
                        {t("safetyPlatform")}
                    </p>

                    <h1>{t("certificateDetailsTitle")}</h1>

                    <p className="page-description">
                        {t("certificateDetailsDescription")}
                    </p>
                </div>

                <div className="certificate-header-actions">
                    <button
                        className="pdf-button"
                        onClick={() => {
                            window.open(
                                getCertificatePDF(certificateNumber),
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }}
                    >
                        {t("viewCertificatePDF")}
                    </button>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/admin/certificates")
                        }
                    >
                        ← {t("back")}
                    </button>
                </div>
            </div>

            <div className="certificate-layout">
                <div className="certificate-card">
                    <div className="certificate-header">
                        <div>
                            <h2>SurakshaSetu</h2>

                            <p>
                                {t("vocationalSafetyTraining")}
                            </p>
                        </div>

                        <div className="certificate-status">
                            ✓ {t("certificateValid")}
                        </div>
                    </div>

                    <div className="certificate-body">
                        <p className="certificate-label">
                            {t("certificateCompletionTitle")}
                        </p>

                        <p>
                            {t("certificatePresentedTo")}
                        </p>

                        <h3>{certificate.worker.name}</h3>

                        <p className="certificate-description">
                            {t("certificateEmployeeId")}:{" "}
                            <strong>
                                {certificate.worker.employeeId}
                            </strong>
                        </p>

                        <p>
                            {t("certificateCompletedModule")}
                        </p>

                        <h4>{certificate.module.title}</h4>

                        <div className="certificate-meta">
                            <div>
                                <span>
                                    {t("certificateScore")}
                                </span>
                                <strong>
                                    {certificate.assessment.score}%
                                </strong>
                            </div>

                            <div>
                                <span>
                                    {t("certificateIssuedOn")}
                                </span>
                                <strong>{formattedIssueDate}</strong>
                            </div>

                            <div>
                                <span>
                                    {t("certificateNumberLabel")}
                                </span>
                                <strong>
                                    {certificate.certificateNumber}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="certificate-footer">
                        {qrCode && (
                            <div className="certificate-qr">
                                <img
                                    src={qrCode}
                                    alt={t("scanToVerify")}
                                />

                                <span>{t("scanToVerify")}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="certificate-info-card">
                    <h2>{t("certificateInformation")}</h2>

                    <div className="info-row">
                        <span>
                            {t("certificateNumberLabel")}
                        </span>
                        <strong>
                            {certificate.certificateNumber}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>{t("certificateTrainee")}</span>
                        <strong>{certificate.worker.name}</strong>
                    </div>

                    <div className="info-row">
                        <span>{t("certificateEmployeeId")}</span>
                        <strong>
                            {certificate.worker.employeeId}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>{t("certificateSector")}</span>
                        <strong>{certificate.worker.sector}</strong>
                    </div>

                    <div className="info-row">
                        <span>{t("certificateSite")}</span>
                        <strong>{certificate.worker.site}</strong>
                    </div>

                    <div className="info-row">
                        <span>{t("module")}</span>
                        <strong>{certificate.module.title}</strong>
                    </div>

                    <div className="info-row">
                        <span>{t("certificateCategory")}</span>
                        <strong>{certificate.module.category}</strong>
                    </div>

                    <div className="info-row">
                        <span>
                            {t("certificateAssessmentScore")}
                        </span>
                        <strong>
                            {certificate.assessment.score}%
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>{t("certificateVerification")}</span>
                        <strong className="valid-text">
                            ✓ {t("certificateValid")}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCertificateDetails;
