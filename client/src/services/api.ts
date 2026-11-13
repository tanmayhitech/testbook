import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getStoredToken, clearStoredToken } from "../lib/auth-storage.js";
import { ApiResponse } from "../types/api.types.js";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Request Interceptor: Attach Bearer JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers && !token.startsWith("mock_")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and parse API response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");
      const isMockToken = getStoredToken()?.startsWith("mock_");
      if (!isAuthEndpoint && !isMockToken) {
        clearStoredToken();
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    if (data?.message) return data.message;
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map((e) => e.message).join(", ");
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
