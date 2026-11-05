
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import {
    getTrainingModuleById,
    createTrainingQuestion,
    updateTrainingQuestion,
    deleteTrainingQuestion,
} from "../../services/training.api";

import type {
    TrainingModule,
    TrainingQuestion,
    TrainingLanguage,
} from "../../types/training";

import type { SaveQuestionInput } from "../../services/training.api";
import "./Module.css";

type QuestionForm = Record<
    TrainingLanguage,
    { question: string; options: string[] }
>;

const LANGUAGES: TrainingLanguage[] = ["EN", "HI", "SAT"];
const OPTION_COUNT = 4;

const emptyForm = (): QuestionForm => ({
    EN: { question: "", options: Array(OPTION_COUNT).fill("") },
    HI: { question: "", options: Array(OPTION_COUNT).fill("") },
    SAT: { question: "", options: Array(OPTION_COUNT).fill("") },
});

const AdminModuleDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [module, setModule] = useState<TrainingModule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<TrainingQuestion | null>(null);
    const [activeLanguage, setActiveLanguage] = useState<TrainingLanguage>("EN");
    const [form, setForm] = useState<QuestionForm>(emptyForm);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formError, setFormError] = useState("");
    const [actionError, setActionError] = useState("");

    const loadModule = async () => {
        if (!id) {
            setError("INVALID_MODULE_ID");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getTrainingModuleById(id);
            setModule(data);
        } catch (err: unknown) {
            console.error(err);
            setError("FAILED_TO_LOAD_MODULE");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!id) {
                setError("INVALID_MODULE_ID");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getTrainingModuleById(id);

                if (!cancelled) setModule(data);
            } catch (err: unknown) {
                console.error(err);
                if (!cancelled) setError("FAILED_TO_LOAD_MODULE");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const getCategoryLabel = (value: string) => {
        switch (value) {
            case "FIRE_SAFETY": return t("fireSafety");
            case "ELECTRICAL_SAFETY": return t("electricalSafety");
            case "CHEMICAL_HANDLING": return t("chemicalHandling");
            case "FALL_PROTECTION": return t("fallProtection");
            default: return value.replaceAll("_", " ");
        }
    };

    const getStatusLabel = (value: string) => {
        switch (value) {
            case "PUBLISHED": return t("published");
            case "DRAFT": return t("draft");
            case "ARCHIVED": return t("archived");
            default: return value;
        }
    };

    const getLanguageLabel = (value: string) => {
        switch (value) {
            case "EN": return t("english");
            case "HI": return t("hindi");
            case "SAT": return t("santali");
            default: return value;
        }
    };

    const openAddModal = () => {
        setEditingQuestion(null);
        setForm(emptyForm());
        setCorrectAnswer(0);
        setActiveLanguage("EN");
        setFormError("");
        setActionError("");
        setModalOpen(true);
    };

    const openEditModal = (question: TrainingQuestion) => {
        const nextForm = emptyForm();

        question.translations.forEach((translation) => {
            nextForm[translation.language] = {
                question: translation.question,
                options: [
                    ...translation.options,
                    ...Array(Math.max(0, OPTION_COUNT - translation.options.length)).fill(""),
                ].slice(0, OPTION_COUNT),
            };
        });

        setEditingQuestion(question);
        setForm(nextForm);
        setCorrectAnswer(question.correctAnswer);
        setActiveLanguage(
            question.translations[0]?.language ?? "EN"
        );
        setFormError("");
        setActionError("");
        setModalOpen(true);
    };

    const updateQuestionField = (
        language: TrainingLanguage,
        field: "question" | "options",
        value: string | string[],
        optionIndex?: number
    ) => {
        setForm((previous) => {
            if (field === "question") {
                return {
                    ...previous,
                    [language]: {
                        ...previous[language],
                        question: value as string,
                    },
                };
            }

            const options = [...previous[language].options];
            options[optionIndex!] = value as string;

            return {
                ...previous,
                [language]: {
                    ...previous[language],
                    options,
                },
            };
        });
    };

    const saveQuestion = async () => {
        if (!id) return;

        setFormError("");
        setActionError("");

        const translations: SaveQuestionInput["translations"] = [];

        for (const language of LANGUAGES) {
            const item = form[language];
            const questionText = item.question.trim();
            const filledOptions = item.options.map((option) => option.trim());

            // Blank optional language tabs are omitted.
            if (!questionText && filledOptions.every((option) => !option)) {
                continue;
            }

            if (questionText.length < 5) {
                setActiveLanguage(language);
                setFormError(
                    `${getLanguageLabel(language)}: ${t("questionMinLength")}`
                );
                return;
            }

            if (filledOptions.some((option) => !option)) {
                setActiveLanguage(language);
                setFormError(
                    `${getLanguageLabel(language)}: ${t("fillAllOptions")}`
                );
                return;
            }

            translations.push({
                language,
                question: questionText,
                options: filledOptions,
            });
        }

        if (translations.length === 0) {
            setFormError(t("atLeastOneQuestionTranslation"));
            return;
        }

        if (translations.some((translation) => correctAnswer >= translation.options.length)) {
            setFormError(t("invalidCorrectAnswer"));
            return;
        }

        const payload: SaveQuestionInput = {
            correctAnswer,
            translations,
        };

        try {
            setSaving(true);

            if (editingQuestion) {
                await updateTrainingQuestion(editingQuestion.id, payload);
            } else {
                await createTrainingQuestion(id, payload);
            }

            setModalOpen(false);
            await loadModule();
        } catch (err: unknown) {
            console.error(err);
            setFormError(t("questionSaveFailed"));
        } finally {
            setSaving(false);
        }
    };

    const removeQuestion = async (question: TrainingQuestion) => {
        const confirmed = window.confirm(t("confirmDeleteQuestion"));

        if (!confirmed) return;

        setDeletingId(question.id);
        setActionError("");

        try {
            await deleteTrainingQuestion(question.id);

            if (expandedQuestion === question.id) {
                setExpandedQuestion(null);
            }

            await loadModule();
        } catch (err: unknown) {
            console.error(err);
            setActionError(t("questionDeleteFailed"));
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="table-state">{t("loadingModuleDetails")}</div>
            </div>
        );
    }

    if (error || !module) {
        return (
            <div className="admin-page">
                <button
                    type="button"
                    className="view-button"
                    onClick={() => navigate("/admin/modules")}
                >
                    ← {t("backToModules")}
                </button>
                <div className="table-state error">
                    {error === "INVALID_MODULE_ID"
                        ? t("invalidModuleId")
                        : error
                          ? t("failedLoadModuleDetails")
                          : t("moduleNotFound")}
                </div>
            </div>
        );
    }

    const englishTranslation = module.translations.find(
        (item) => item.language === "EN"
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">{t("safetyPlatform")}</p>
                    <h1>
                        {englishTranslation?.title ??
                            module.translations[0]?.title ??
                            t("untitledModule")}
                    </h1>
                    <p className="page-description">
                        {t("moduleDetailsDescription")}
                    </p>
                </div>

                <button
                    type="button"
                    className="view-button"
                    onClick={() => navigate("/admin/modules")}
                >
                    ← {t("backToModules")}
                </button>
            </div>

            <div className="table-card module-details-card">
                <div className="table-header">
                    <div>
                        <h2>{t("moduleInformation")}</h2>
                        <p>{module.id}</p>
                    </div>
                    <span className={`status-badge ${module.status.toLowerCase()}`}>
                        {getStatusLabel(module.status)}
                    </span>
                </div>

                <div className="module-details-grid">
                    <div>
                        <span>{t("category")}</span>
                        <strong>{getCategoryLabel(module.category)}</strong>
                    </div>
                    <div>
                        <span>{t("duration")}</span>
                        <strong>{module.durationMin} {t("minutes")}</strong>
                    </div>
                    <div>
                        <span>{t("questions")}</span>
                        <strong>{module.questions?.length ?? 0}</strong>
                    </div>
                    <div>
                        <span>{t("languages")}</span>
                        <strong>
                            {module.translations
                                .map((item) => getLanguageLabel(item.language))
                                .join(", ")}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="table-card module-details-card">
                <div className="table-header">
                    <div>
                        <h2>{t("moduleTranslations")}</h2>
                        <p>{t("moduleTranslationsDescription")}</p>
                    </div>
                </div>

                <div className="module-translation-list">
                    {module.translations.map((translation) => (
                        <section
                            key={translation.language}
                            className="module-translation-item"
                        >
                            <span className="language-badge">
                                {getLanguageLabel(translation.language)}
                            </span>
                            <h3>{translation.title}</h3>
                            <p>
                                {translation.description ||
                                    t("noDescriptionAvailable")}
                            </p>
                        </section>
                    ))}
                </div>
            </div>

            <div className="table-card module-details-card">
                <div className="table-header question-section-header">
                    <div>
                        <h2>{t("moduleQuestions")}</h2>
                        <p>
                            {module.questions?.length ?? 0} {t("questions")}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="question-primary-button"
                        onClick={openAddModal}
                    >
                        + {t("addQuestion")}
                    </button>
                </div>

                {actionError && (
                    <div className="table-state error">{actionError}</div>
                )}

                {!module.questions?.length ? (
                    <div className="table-state">
                        {t("noQuestionsAvailable")}
                    </div>
                ) : (
                    <div className="module-question-list">
                        {module.questions.map((question, index) => {
                            const isExpanded = expandedQuestion === question.id;
                            const preview =
                                question.translations.find((item) => item.language === "EN") ??
                                question.translations[0];

                            return (
                                <section
                                    key={question.id}
                                    className="module-question-item"
                                >
                                    <div className="question-summary">
                                        <button
                                            type="button"
                                            className="question-expand-button"
                                            onClick={() =>
                                                setExpandedQuestion(
                                                    isExpanded ? null : question.id
                                                )
                                            }
                                            aria-expanded={isExpanded}
                                        >
                                            <span className="question-number">
                                                {index + 1}
                                            </span>
                                            <span className="question-preview">
                                                <strong>
                                                    {preview?.question ?? t("untitledQuestion")}
                                                </strong>
                                                <small>
                                                    {question.translations.length}{" "}
                                                    {t("languages")} ·{" "}
                                                    {preview?.options.length ?? 0}{" "}
                                                    {t("options")}
                                                </small>
                                            </span>
                                            <span className="question-chevron">
                                                {isExpanded ? "−" : "+"}
                                            </span>
                                        </button>

                                        <div className="question-actions">
                                            <button
                                                type="button"
                                                className="question-action-button"
                                                onClick={() => openEditModal(question)}
                                            >
                                                {t("edit")}
                                            </button>
                                            <button
                                                type="button"
                                                className="question-action-button danger"
                                                disabled={deletingId === question.id}
                                                onClick={() => void removeQuestion(question)}
                                            >
                                                {deletingId === question.id
                                                    ? t("deleting")
                                                    : t("delete")}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="question-expanded-content">
                                            {question.translations.map((translation) => (
                                                <div
                                                    key={translation.language}
                                                    className="question-detail-translation"
                                                >
                                                    <span className="language-badge">
                                                        {getLanguageLabel(translation.language)}
                                                    </span>
                                                    <p>{translation.question}</p>
                                                    <ol className="question-options-list">
                                                        {translation.options.map((option, optionIndex) => (
                                                            <li
                                                                key={`${translation.language}-${optionIndex}`}
                                                                className={
                                                                    optionIndex === question.correctAnswer
                                                                        ? "correct-option"
                                                                        : ""
                                                                }
                                                            >
                                                                {option}
                                                                {optionIndex === question.correctAnswer && (
                                                                    <span className="correct-answer-label">
                                                                        {t("correctAnswer")}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>

            {modalOpen && (
                <div
                    className="question-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            setModalOpen(false);
                        }
                    }}
                >
                    <div
                        className="question-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="question-modal-title"
                    >
                        <div className="question-modal-header">
                            <div>
                                <h2 id="question-modal-title">
                                    {editingQuestion
                                        ? t("editQuestion")
                                        : t("addQuestion")}
                                </h2>
                                <p>{t("questionModalDescription")}</p>
                            </div>
                            <button
                                type="button"
                                className="question-modal-close"
                                disabled={saving}
                                onClick={() => setModalOpen(false)}
                                aria-label={t("close")}
                            >
                                ×
                            </button>
                        </div>

                        <div className="question-modal-body">
                            <div className="question-language-tabs">
                                {LANGUAGES.map((language) => {
                                    const hasContent =
                                        Boolean(form[language].question.trim());

                                    return (
                                        <button
                                            type="button"
                                            key={language}
                                            className={
                                                activeLanguage === language
                                                    ? "question-language-tab active"
                                                    : "question-language-tab"
                                            }
                                            onClick={() => setActiveLanguage(language)}
                                        >
                                            {getLanguageLabel(language)}
                                            {hasContent && (
                                                <span className="translation-present-dot" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="question-optional-hint">
                                {t("questionLanguageOptional")}
                            </p>

                            <label className="question-form-label">
                                {t("questionText")}
                                <textarea
                                    rows={3}
                                    value={form[activeLanguage].question}
                                    onChange={(event) =>
                                        updateQuestionField(
                                            activeLanguage,
                                            "question",
                                            event.target.value
                                        )
                                    }
                                    placeholder={t("enterQuestionText")}
                                />
                            </label>

                            <div className="question-options-heading">
                                <strong>{t("answerOptions")}</strong>
                                <span>{t("selectCorrectAnswer")}</span>
                            </div>

                            <div className="question-form-options">
                                {form[activeLanguage].options.map((option, index) => (
                                    <div
                                        className="question-option-input-row"
                                        key={index}
                                    >
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={correctAnswer === index}
                                            onChange={() => setCorrectAnswer(index)}
                                            aria-label={`${t("correctAnswer")}: ${t("option")} ${index + 1}`}
                                        />
                                        <span className="question-option-index">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(event) =>
                                                updateQuestionField(
                                                    activeLanguage,
                                                    "options",
                                                    event.target.value,
                                                    index
                                                )
                                            }
                                            placeholder={`${t("option")} ${index + 1}`}
                                        />
                                        {correctAnswer === index && (
                                            <span className="correct-answer-label">
                                                {t("correctAnswer")}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {formError && (
                                <div className="question-form-error">
                                    {formError}
                                </div>
                            )}
                        </div>

                        <div className="question-modal-footer">
                            <button
                                type="button"
                                className="question-secondary-button"
                                disabled={saving}
                                onClick={() => setModalOpen(false)}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="button"
                                className="question-primary-button"
                                disabled={saving}
                                onClick={() => void saveQuestion()}
                            >
                                {saving
                                    ? t("saving")
                                    : editingQuestion
                                      ? t("saveChanges")
                                      : t("addQuestion")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModuleDetails;
