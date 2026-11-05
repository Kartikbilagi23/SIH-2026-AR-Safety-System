
import { useEffect, useState } from "react";

import {
    getReportOverview,
    getTrainingStatusReport,
    getModulePerformanceReport,
    getTrainingTrendReport,
    getRecentTrainingActivity,
    exportReport,
} from "../../services/reportApi";

import TrainingActivityChart from "../../components/reports/TrainingActivityChart";
import TrainingStatusChart from "../../components/reports/TrainingStatusChart";
import { useLanguage } from "../../context/LanguageContext";
import "./Report.css";

interface OverviewData {
    summary: {
        totalWorkers: number;
        totalSessions: number;
        completedSessions: number;
        inProgressSessions: number;
        failedSessions: number;
        passedSessions: number;
        certificatesIssued: number;
        completionRate: number;
        passRate: number;
        averageScore: number;
    };
}

interface StatusData {
    statusDistribution: {
        status: string;
        count: number;
    }[];
}

interface ModuleData {
    modules: {
        moduleId: string;
        moduleName: string;
        category: string;
        attempts: number;
        completed: number;
        passed: number;
        failed: number;
        averageScore: number;
    }[];
}

interface TrendData {
    trend: {
        date: string;
        started: number;
        completed: number;
    }[];
}

interface ActivityData {
    activity: {
        sessionId: string;
        workerName: string;
        employeeId: string;
        moduleName: string;
        category: string;
        score: number | null;
        status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
        attemptNumber: number;
        startedAt: string;
        completedAt: string | null;
    }[];
}

type TrainingStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";

const Reports = () => {
    const { t, language } = useLanguage();

    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [status, setStatus] = useState<StatusData | null>(null);
    const [modules, setModules] = useState<ModuleData | null>(null);
    const [trend, setTrend] = useState<TrendData | null>(null);
    const [activity, setActivity] = useState<ActivityData | null>(null);

    const [exporting, setExporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const dateLocale = language === "hi" ? "hi-IN" : "en-IN";

    useEffect(() => {
        const loadReports = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    overviewData,
                    statusData,
                    moduleData,
                    trendData,
                    activityData,
                ] = await Promise.all([
                    getReportOverview(),
                    getTrainingStatusReport(),
                    getModulePerformanceReport(),
                    getTrainingTrendReport(),
                    getRecentTrainingActivity(),
                ]);

                setOverview(overviewData);
                setStatus(statusData);
                setModules(moduleData);
                setTrend(trendData);
                setActivity(activityData);
            } catch (err) {
                console.error("Failed to load reports:", err);
                setError("reportsLoadError");
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, []);

    const handleExportReport = async () => {
        try {
            setExporting(true);

            const blob = await exportReport();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `SurakshaSetu-Training-Report-${
                new Date().toISOString().split("T")[0]
            }.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Report export failed:", err);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-slate-500">
                    {t("reportsLoading")}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                {t("reportsLoadError")}
            </div>
        );
    }

    const summary = overview?.summary;

    return (
        <div className="reports-page">
            <div className="reports-header">
                <div>
                    <div className="reports-breadcrumb">
                        {t("reportsBreadcrumb")}
                    </div>

                    <h1>{t("reportsTitle")}</h1>

                    <p>{t("reportsDescription")}</p>
                </div>

                <button
                    type="button"
                    className="reports-export-btn"
                    onClick={handleExportReport}
                    disabled={exporting}
                >
                    <span>↓</span>
                    {exporting
                        ? t("reportsGenerating")
                        : t("reportsExport")}
                </button>
            </div>

            <div className="reports-kpi-grid">
                <Stat
                    title={t("reportsTotalWorkers")}
                    value={summary?.totalWorkers ?? 0}
                    icon="👥"
                    accent="blue"
                />

                <Stat
                    title={t("reportsTrainingSessions")}
                    value={summary?.totalSessions ?? 0}
                    icon="📋"
                    accent="indigo"
                />

                <Stat
                    title={t("reportsCompleted")}
                    value={summary?.completedSessions ?? 0}
                    icon="✓"
                    accent="green"
                />

                <Stat
                    title={t("reportsPassRate")}
                    value={`${summary?.passRate ?? 0}%`}
                    icon="↗"
                    accent="orange"
                />

                <Stat
                    title={t("reportsAverageScore")}
                    value={`${summary?.averageScore ?? 0}%`}
                    icon="★"
                    accent="purple"
                />

                <Stat
                    title={t("reportsCertificates")}
                    value={summary?.certificatesIssued ?? 0}
                    icon="▣"
                    accent="teal"
                />
            </div>

            <div className="reports-chart-grid">
                <section className="report-card report-chart-large">
                    <div className="report-card-header">
                        <div>
                            <h2>{t("reportsTrainingActivity")}</h2>
                            <p>{t("reportsActivityDescription")}</p>
                        </div>

                        <span className="report-period">
                            {t("reportsLast7Days")}
                        </span>
                    </div>

                    <div className="report-chart-placeholder">
                        {trend?.trend && (
                            <TrainingActivityChart data={trend.trend} />
                        )}
                    </div>
                </section>

                <section className="report-card">
                    <div className="report-card-header">
                        <div>
                            <h2>{t("reportsTrainingStatus")}</h2>
                            <p>{t("reportsStatusDescription")}</p>
                        </div>
                    </div>

                    <div className="report-chart-placeholder">
                        {status?.statusDistribution && (
                            <TrainingStatusChart
                                data={status.statusDistribution}
                            />
                        )}
                    </div>
                </section>
            </div>

            <section className="report-card">
                <div className="report-card-header">
                    <div>
                        <h2>{t("reportsModulePerformance")}</h2>
                        <p>{t("reportsModuleDescription")}</p>
                    </div>

                    <button type="button" className="report-view-btn">
                        {t("reportsViewAll")} →
                    </button>
                </div>

                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>{t("reportsTrainingModule")}</th>
                                <th>{t("reportsCategory")}</th>
                                <th>{t("reportsAttempts")}</th>
                                <th>{t("reportsCompleted")}</th>
                                <th>{t("reportsPassed")}</th>
                                <th>{t("reportsFailed")}</th>
                                <th>{t("reportsAverageShort")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {modules?.modules.length ? (
                                modules.modules.map((module) => (
                                    <tr key={module.moduleId}>
                                        <td>
                                            <div className="module-name">
                                                {module.moduleName}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="category-badge">
                                                {module.category}
                                            </span>
                                        </td>

                                        <td>{module.attempts}</td>
                                        <td>{module.completed}</td>

                                        <td>
                                            <span className="table-success">
                                                {module.passed}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="table-danger">
                                                {module.failed}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {module.averageScore}%
                                            </strong>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
                                        {t("reportsNoModuleData")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="report-card">
                <div className="report-card-header">
                    <div>
                        <h2>{t("reportsRecentActivity")}</h2>
                        <p>{t("reportsRecentDescription")}</p>
                    </div>
                </div>

                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>{t("reportsWorker")}</th>
                                <th>{t("reportsTrainingModule")}</th>
                                <th>{t("reportsAttempt")}</th>
                                <th>{t("reportsScore")}</th>
                                <th>{t("reportsStatus")}</th>
                                <th>{t("reportsDate")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {activity?.activity.length ? (
                                activity.activity.map((item) => (
                                    <tr key={item.sessionId}>
                                        <td>
                                            <div className="worker-cell">
                                                <div className="worker-avatar">
                                                    {item.workerName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {item.workerName}
                                                    </strong>
                                                    <span>{item.employeeId}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{item.moduleName}</td>
                                        <td>#{item.attemptNumber}</td>

                                        <td>
                                            {item.score !== null
                                                ? `${item.score}%`
                                                : "—"}
                                        </td>

                                        <td>
                                            <StatusBadge status={item.status} />
                                        </td>

                                        <td className="date-cell">
                                            {new Date(
                                                item.startedAt
                                            ).toLocaleDateString(dateLocale)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>
                                        {t("reportsNoActivityData")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const Stat = ({
    title,
    value,
    icon,
    accent,
}: {
    title: string;
    value: string | number;
    icon: string;
    accent: string;
}) => {
    const { t } = useLanguage();

    return (
        <div className={`report-stat-card ${accent}`}>
            <div className="stat-top">
                <span className="stat-title">{title}</span>
                <span className="stat-icon">{icon}</span>
            </div>

            <div className="stat-value">{value}</div>

            <div className="stat-footer">
                <span>{t("reportsTrainingSafety")}</span>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: TrainingStatus }) => {
    const { t } = useLanguage();

    const config: Record<
        TrainingStatus,
        { label: string; className: string }
    > = {
        COMPLETED: {
            label: t("reportsCompleted"),
            className: "status-completed",
        },
        IN_PROGRESS: {
            label: t("reportsInProgress"),
            className: "status-progress",
        },
        FAILED: {
            label: t("reportsFailed"),
            className: "status-failed",
        },
    };

    const current = config[status];

    return (
        <span className={`status-badge ${current.className}`}>
            <span className="status-dot" />
            {current.label}
        </span>
    );
};

export default Reports;
