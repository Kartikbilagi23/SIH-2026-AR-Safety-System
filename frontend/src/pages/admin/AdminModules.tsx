import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import { getTrainingModules } from "../../services/training.api";

import type {
    TrainingCategory,
    TrainingModule,
    TrainingModuleStatus,
} from "../../types/training";

const AdminModules = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [category, setCategory] =
        useState<TrainingCategory | "ALL">("ALL");
    const [status, setStatus] =
        useState<TrainingModuleStatus | "ALL">("ALL");

    useEffect(() => {
        const loadModules = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getTrainingModules();
                setModules(data);
            } catch (error: unknown) {
                console.error(error);
                setError("FAILED_TO_LOAD_MODULES");
            } finally {
                setLoading(false);
            }
        };

        void loadModules();
    }, []);

    const getTitle = (module: TrainingModule) => {
        return (
            module.translations.find(
                (translation) => translation.language === "EN"
            )?.title ??
            module.translations[0]?.title ??
            t("untitledModule")
        );
    };

    const getLanguages = (module: TrainingModule) => {
        return module.translations.map(
            (translation) => translation.language
        );
    };

    const getLanguageLabel = (value: string) => {
        switch (value.toUpperCase()) {
            case "EN":
                return t("english");
            case "HI":
                return t("hindi");
            case "SAT":
                return t("santali");
            default:
                return value;
        }
    };

    const getCategoryLabel = (value: string) => {
        switch (value) {
            case "FIRE_SAFETY":
                return t("fireSafety");
            case "ELECTRICAL_SAFETY":
                return t("electricalSafety");
            case "CHEMICAL_HANDLING":
                return t("chemicalHandling");
            case "FALL_PROTECTION":
                return t("fallProtection");
            default:
                return value.replaceAll("_", " ");
        }
    };

    const getStatusLabel = (value: string) => {
        switch (value) {
            case "PUBLISHED":
                return t("published");
            case "DRAFT":
                return t("draft");
            case "ARCHIVED":
                return t("archived");
            default:
                return value;
        }
    };

    const getStatusClass = (value: string) => {
        switch (value) {
            case "PUBLISHED":
                return "status-badge published";
            case "DRAFT":
                return "status-badge draft";
            case "ARCHIVED":
                return "status-badge archived";
            default:
                return "status-badge";
        }
    };

    const filteredModules = useMemo(() => {
        return modules.filter((module) => {
            const title = getTitle(module).toLowerCase();

            const matchesSearch =
                title.includes(search.toLowerCase());

            const matchesCategory =
                category === "ALL" ||
                module.category === category;

            const matchesStatus =
                status === "ALL" ||
                module.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [modules, search, category, status]);

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">
                        {t("safetyPlatform")}
                    </p>

                    <h1>{t("trainingModulesTitle")}</h1>

                    <p className="page-description">
                        {t("manageModulesDescription")}
                    </p>
                </div>

                <div className="summary-card">
                    <strong>{modules.length}</strong>
                    <span>{t("totalModules")}</span>
                </div>
            </div>

            <div className="filters-card">
                <div className="search-box">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder={t("searchModules")}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    value={category}
                    aria-label={t("category")}
                    onChange={(event) =>
                        setCategory(
                            event.target.value as TrainingCategory | "ALL"
                        )
                    }
                >
                    <option value="ALL">{t("allCategories")}</option>
                    <option value="FIRE_SAFETY">{t("fireSafety")}</option>
                    <option value="ELECTRICAL_SAFETY">
                        {t("electricalSafety")}
                    </option>
                    <option value="CHEMICAL_HANDLING">
                        {t("chemicalHandling")}
                    </option>
                    <option value="FALL_PROTECTION">
                        {t("fallProtection")}
                    </option>
                </select>

                <select
                    value={status}
                    aria-label={t("status")}
                    onChange={(event) =>
                        setStatus(
                            event.target.value as TrainingModuleStatus | "ALL"
                        )
                    }
                >
                    <option value="ALL">{t("allStatuses")}</option>
                    <option value="PUBLISHED">{t("published")}</option>
                    <option value="DRAFT">{t("draft")}</option>
                    <option value="ARCHIVED">{t("archived")}</option>
                </select>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <div>
                        <h2>{t("trainingModulesTitle")}</h2>
                        <p>
                            {t("showing")} {filteredModules.length} {t("of")}{" "}
                            {modules.length}
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="table-state">
                        {t("loadingModules")}
                    </div>
                )}

                {error && (
                    <div className="table-state error">
                        {error === "FAILED_TO_LOAD_MODULES"
                            ? t("failedLoadModules")
                            : error}
                    </div>
                )}

                {!loading && !error && filteredModules.length === 0 && (
                    <div className="table-state">
                        {t("noModulesFound")}
                    </div>
                )}

                {!loading && !error && filteredModules.length > 0 && (
                    <div className="modules-table-wrapper">
                        <table className="modules-table">
                            <thead>
                                <tr>
                                    <th>{t("module")}</th>
                                    <th>{t("category")}</th>
                                    <th>{t("duration")}</th>
                                    <th>{t("questions")}</th>
                                    <th>{t("languages")}</th>
                                    <th>{t("status")}</th>
                                    <th>{t("action")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredModules.map((module) => (
                                    <tr key={module.id}>
                                        <td>
                                            <div className="module-name">
                                                <div className="module-icon">
                                                    📚
                                                </div>

                                                <div>
                                                    <strong>
                                                        {getTitle(module)}
                                                    </strong>
                                                    <small>{module.id}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            {getCategoryLabel(module.category)}
                                        </td>

                                        <td>
                                            {module.durationMin} {t("minutes")}
                                        </td>

                                        <td>
                                            {module.questions?.length ?? 0}
                                        </td>

                                        <td>
                                            <div className="language-list">
                                                {getLanguages(module).map(
                                                    (language) => (
                                                        <span
                                                            key={language}
                                                            className="language-badge"
                                                        >
                                                            {getLanguageLabel(language)}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    module.status
                                                )}
                                            >
                                                {getStatusLabel(module.status)}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="view-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/modules/${module.id}`
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

export default AdminModules;
