import { api, extractErrorMessage } from "./api.js";
import {
  AuthResponseData,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth.types.js";
import { ApiResponse } from "../types/api.types.js";
import { mockStore } from "../mock/mockStore.js";
import { getStoredToken } from "../lib/auth-storage.js";

const isDemoSession = (): boolean => {
  const token = getStoredToken();
  return Boolean(token && token.startsWith("mock_"));
};

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    try {
      const response = await api.post<ApiResponse<AuthResponseData>>(
        "/auth/register",
        credentials
      );
      if (response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Registration failed");
    } catch (error) {
      if (isDemoSession()) {
        return mockStore.register(credentials);
      }
      throw new Error(extractErrorMessage(error, "Registration failed"));
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    try {
      const response = await api.post<ApiResponse<AuthResponseData>>(
        "/auth/login",
        credentials
      );
      if (response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Login failed");
    } catch (error) {
      if (isDemoSession()) {
        return mockStore.login(credentials);
      }
      throw new Error(extractErrorMessage(error, "Login failed"));
    }
  },

  async getMe(): Promise<User> {
    if (isDemoSession()) {
      return mockStore.getCurrentUser();
    }

    try {
      const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
      if (response.data.data?.user) {
        return response.data.data.user;
      }
      throw new Error("Failed to load user session");
    } catch (error) {
      if (isDemoSession()) {
        return mockStore.getCurrentUser();
      }
      throw new Error(extractErrorMessage(error, "Failed to load user session"));
    }
  },
};
