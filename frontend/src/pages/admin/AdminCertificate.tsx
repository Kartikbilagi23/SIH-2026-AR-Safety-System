import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Award } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type CertificateStatus = "ISSUED" | "PENDING" | "REVOKED";

interface Certificate {
    id: string;
    certificateNumber: string;
    employeeId: string;
    traineeName: string;
    moduleName: string;
    issuedAt: string | null;
    status: CertificateStatus;
}

const AdminCertificates = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<CertificateStatus | "ALL">("ALL");

    useEffect(() => {
        const loadCertificates = async () => {
            try {
                setLoading(true);
                setError(null);

                /*
                 * Replace this mock data with the certificate API
                 * when the service is connected.
                 */
                const data: Certificate[] = [
                    {
                        id: "cert-001",
                        certificateNumber: "ARS-MURQ05KZ-9V6G74",
                        employeeId: "MIN-001",
                        traineeName: "Ravi Kumar",
                        moduleName: "Fire & Explosion Safety",
                        issuedAt: "2026-10-04",
                        status: "ISSUED",
                    },
                ];

                setCertificates(data);
            } catch (error: unknown) {
                console.error(error);
                setError("FAILED_TO_LOAD_CERTIFICATES");
            } finally {
                setLoading(false);
            }
        };

        void loadCertificates();
    }, []);

    const filteredCertificates = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return certificates.filter((certificate) => {
            const matchesSearch =
                certificate.traineeName.toLowerCase().includes(searchValue) ||
                certificate.employeeId.toLowerCase().includes(searchValue) ||
                certificate.moduleName.toLowerCase().includes(searchValue) ||
                certificate.certificateNumber.toLowerCase().includes(searchValue);

            const matchesStatus =
                status === "ALL" || certificate.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [certificates, search, status]);

    const getStatusLabel = (value: CertificateStatus) => {
        switch (value) {
            case "ISSUED":
                return t("certificateIssued");
            case "PENDING":
                return t("certificatePending");
            case "REVOKED":
                return t("certificateRevoked");
        }
    };

    const getStatusClass = (value: CertificateStatus) => {
        switch (value) {
            case "ISSUED":
                return "certificate-status issued";
            case "PENDING":
                return "certificate-status pending";
            case "REVOKED":
                return "certificate-status revoked";
            default:
                return "certificate-status";
        }
    };

    const issuedCount = certificates.filter(
        (certificate) => certificate.status === "ISSUED"
    ).length;

    const dateLocale =
        language === "hi"
            ? "hi-IN"
            : language === "sat"
                ? "sat-IN"
                : "en-IN";

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">
                        {t("safetyPlatform")}
                    </p>

                    <h1>{t("certificates")}</h1>

                    <p className="page-description">
                        {t("manageCertificatesDescription")}
                    </p>
                </div>

                <div className="summary-card">
                    <strong>{issuedCount}</strong>
                    <span>{t("issuedCertificatesCount")}</span>
                </div>
            </div>

            <div className="filters-card">
                <div className="search-box">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder={t("searchCertificates")}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    value={status}
                    aria-label={t("status")}
                    onChange={(event) =>
                        setStatus(
                            event.target.value as CertificateStatus | "ALL"
                        )
                    }
                >
                    <option value="ALL">
                        {t("certificateAllStatuses")}
                    </option>
                    <option value="ISSUED">
                        {t("certificateIssued")}
                    </option>
                    <option value="PENDING">
                        {t("certificatePending")}
                    </option>
                    <option value="REVOKED">
                        {t("certificateRevoked")}
                    </option>
                </select>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <div>
                        <h2>{t("certificates")}</h2>
                        <p>
                            {t("showing")} {filteredCertificates.length}{" "}
                            {t("of")} {certificates.length}
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="table-state">
                        {t("loadingCertificates")}
                    </div>
                )}

                {error && (
                    <div className="table-state error">
                        {error === "FAILED_TO_LOAD_CERTIFICATES"
                            ? t("failedLoadCertificates")
                            : error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredCertificates.length === 0 && (
                        <div className="table-state">
                            {t("noCertificatesFound")}
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredCertificates.length > 0 && (
                        <div className="modules-table-wrapper">
                            <table className="modules-table">
                                <thead>
                                    <tr>
                                        <th>{t("certificateColumn")}</th>
                                        <th>{t("traineeColumn")}</th>
                                        <th>{t("moduleColumn")}</th>
                                        <th>{t("issuedOn")}</th>
                                        <th>{t("status")}</th>
                                        <th>{t("action")}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCertificates.map((certificate) => (
                                        <tr key={certificate.id}>
                                            <td>
                                                <div className="module-name">
                                                    <div className="module-icon">
                                                        <Award size={21} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {certificate.certificateNumber}
                                                        </strong>
                                                        <small>
                                                            {certificate.employeeId}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>{certificate.traineeName}</td>
                                            <td>{certificate.moduleName}</td>

                                            <td>
                                                {certificate.issuedAt
                                                    ? new Date(
                                                        `${certificate.issuedAt}T00:00:00`
                                                    ).toLocaleDateString(
                                                        dateLocale,
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "—"}
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        certificate.status
                                                    )}
                                                >
                                                    {getStatusLabel(certificate.status)}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="view-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/certificates/${certificate.certificateNumber}`
                                                        )
                                                    }
                                                >
                                                    {t("view")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default AdminCertificates;
