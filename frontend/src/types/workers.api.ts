import {api} from "../services/api";

export interface Worker {
    id: string;
    name: string;
    employeeId: string;
    phone: string;
    sector: string;
    site: string;
    language: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkersResponse {
    success: boolean;
    data: Worker[];
}

export const getWorkers = async (): Promise<Worker[]> => {
    const response =
        await api.get<WorkersResponse>("/workers");

    return response.data.data;
};