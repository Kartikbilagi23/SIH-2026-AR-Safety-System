import { api } from "./api";
import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<
    ApiResponse<LoginResponse>
  >("/auth/login", payload);

  return response.data.data;
};