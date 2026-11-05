
import { data } from "react-router-dom";
import type {
    ApiResponse,
    TrainingQuestion,
    TrainingModule,
    TrainingLanguage,
} from "../types/training";
import { api } from "./api";

interface QuestionTranslationInput {
    language: TrainingLanguage;
    question: string;
    options: string[];
}

export interface SaveQuestionInput {
    correctAnswer: number;
    translations: QuestionTranslationInput[];
}

export const createTrainingQuestion = async (
    moduleId: string,
    data: SaveQuestionInput
): Promise<TrainingQuestion> => {
    const response = await api.post<ApiResponse<TrainingQuestion>>(
        `/training-modules/${moduleId}/questions`,
        data
    );

    return response.data.data;
};


export const getTrainingModules = async (): Promise<
    TrainingModule[]
> => {
    const response = await api.get<
        ApiResponse<TrainingModule[]>
>("/training-modules");
return response.data.data;
}



export const updateTrainingQuestion = async (
    questionId: string,
    data: SaveQuestionInput
): Promise<TrainingQuestion> => {
    const response = await api.patch<ApiResponse<TrainingQuestion>>(
        `/training-modules/questions/${questionId}`,
        data
    );

    return response.data.data;
};

export const deleteTrainingQuestion = async (
    questionId: string
): Promise<void> => {
    await api.delete(
        `/training-modules/questions/${questionId}`
    );
};

export const getTrainingModuleById = async (
    moduleId: string
): Promise<TrainingModule> => {
    const response = await api.get<
        ApiResponse<TrainingModule>
    >(`/training-modules/${moduleId}`);

    return response.data.data;
};