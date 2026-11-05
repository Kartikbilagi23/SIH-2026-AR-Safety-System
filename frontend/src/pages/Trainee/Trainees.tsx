import { useEffect, useMemo, useState } from "react";
import { getWorkers, type Worker } from "../../types/workers.api";
import { useLanguage } from "../../context/LanguageContext";
import "./Trainees.css";

const Trainees = () => {
    const { t } = useLanguage();

    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState<string>("");
    const [sector, setSector] = useState<string>("ALL");
    const [language, setLanguage] = useState<string>("ALL");

    useEffect(() => {
        const fetchWorkers = async (): Promise<void> => {
            try {
                setLoading(true);
                setError(null);

                const data = await getWorkers();
                setWorkers(data);
            } catch (error: unknown) {
                console.error(error);
                setError("FAILED_TO_LOAD_TRAINEES");
            } finally {
                setLoading(false);
            }
        };

        void fetchWorkers();
    }, []);

    const sectors = useMemo<string[]>(() => {
        return Array.from(
            new Set(workers.map((worker) => worker.sector))
        );
    }, [workers]);

    const languages = useMemo<string[]>(() => {
        return Array.from(
            new Set(workers.map((worker) => worker.language))
        );
    }, [workers]);

    const filteredWorkers = useMemo<Worker[]>(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return workers.filter((worker) => {
            const matchesSearch =
                normalizedSearch === "" ||
                worker.name.toLowerCase().includes(normalizedSearch) ||
                worker.employeeId.toLowerCase().includes(normalizedSearch) ||
                worker.site.toLowerCase().includes(normalizedSearch);

            const matchesSector =
                sector === "ALL" || worker.sector === sector;

            const matchesLanguage =
                language === "ALL" || worker.language === language;

            return matchesSearch && matchesSector && matchesLanguage;
        });
    }, [workers, search, sector, language]);

    const getLanguageLabel = (value: string): string => {
        switch (value.toUpperCase()) {
            case "EN":
                return t("english");
            case "HI":
                return t("hindi");
            case "SAT":
                return t("santali");
            default:
                return value.toUpperCase();
        }
    };

    if (loading) {
        return (
            <section className="page-content">
                <div className="page-state">
                    {t("loadingTrainees")}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="page-content">
                <div className="page-state error-state">
                    {error === "FAILED_TO_LOAD_TRAINEES"
                        ? t("failedLoadTrainees")
                        : error}
                </div>
            </section>
        );
    }

    return (
        <section className="page-content trainees-page">
            <div className="trainees-header">
                <div>
                    <h1>{t("traineeManagement")}</h1>
                    <p>{t("traineesDescription")}</p>
                </div>

                <div className="trainee-total">
                    <span>{workers.length}</span>
                    <small>{t("totalTrainees")}</small>
                </div>
            </div>

            <div className="trainee-filters">
                <div className="search-box">
                    <span>⌕</span>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("searchTrainees")}
                    />
                </div>

                <select
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                    aria-label={t("sector")}
                >
                    <option value="ALL">{t("allSectors")}</option>

                    {sectors.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    aria-label={t("language")}
                >
                    <option value="ALL">{t("allLanguages")}</option>

                    {languages.map((item) => (
                        <option key={item} value={item}>
                            {getLanguageLabel(item)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <div>
                        <h2>{t("trainees")}</h2>
                        <span>
                            {t("showing")} {filteredWorkers.length} {t("of")}{" "}
                            {workers.length}
                        </span>
                    </div>
                </div>

                {filteredWorkers.length === 0 ? (
                    <div className="empty-state">
                        <h3>{t("noTraineesFound")}</h3>
                        <p>{t("changeSearchFilters")}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="trainees-table">
                            <thead>
                                <tr>
                                    <th>{t("empId")}</th>
                                    <th>{t("name")}</th>
                                    <th>{t("sector")}</th>
                                    <th>{t("plantSite")}</th>
                                    <th>{t("language")}</th>
                                    <th>{t("modules")}</th>
                                    <th>{t("status")}</th>
                                    <th>{t("action")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredWorkers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td>
                                            <strong>{worker.employeeId}</strong>
                                        </td>

                                        <td>
                                            <div className="worker-name">
                                                <div className="worker-avatar">
                                                    {worker.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{worker.name}</span>
                                            </div>
                                        </td>

                                        <td>{worker.sector}</td>
                                        <td>{worker.site}</td>

                                        <td>
                                            <span className="language-badge">
                                                {getLanguageLabel(worker.language)}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="not-available">—</span>
                                        </td>

                                        <td>
                                            <span className="status-badge status-new">
                                                {t("registered")}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="view-button"
                                                onClick={() => console.log(worker.id)}
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
        </section>
    );
};

export default Trainees;
