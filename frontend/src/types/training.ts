export type TrainingLanguage = "EN" | "HI" | "SAT";

export type TrainingModuleStatus =
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";

export type TrainingCategory =
    | "FIRE_SAFETY"
    | "ELECTRICAL_SAFETY"
    | "CHEMICAL_HANDLING"
    | "FALL_PROTECTION";

export interface ModuleTranslation {
    id: string;
    moduleId: string;
    language: TrainingLanguage;
    title: string;
    description?: string | null;
}

export interface TrainingQuestionTranslation {
    id: string;
    questionId: string;
    language: TrainingLanguage;
    question: string;
    options: string[];
}

export interface TrainingQuestion {
    id: string;
    moduleId: string;
    correctAnswer: number;
    translations: TrainingQuestionTranslation[];
}

export interface TrainingModule {
    id: string;
    category: TrainingCategory;
    durationMin: number;
    status: TrainingModuleStatus;
    translations: ModuleTranslation[];
    questions?: TrainingQuestion[];
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}