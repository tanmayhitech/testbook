import { api, extractErrorMessage } from "./api.js";
import {
  CreateRepositoryPayload,
  Repository,
  RepositoryMember,
  UpdateRepositoryPayload,
} from "../types/repository.types.js";
import { ApiResponse } from "../types/api.types.js";
import { mockStore } from "../mock/mockStore.js";
import { getStoredToken } from "../lib/auth-storage.js";

const isDemoSession = (): boolean => {
  const token = getStoredToken();
  return Boolean(token && token.startsWith("mock_"));
};

export const repositoryService = {
  async list(): Promise<Repository[]> {
    if (isDemoSession()) {
      return mockStore.getRepositories();
    }
    try {
      const response = await api.get<ApiResponse<Repository[]>>("/repos");
      if (response.data.data) return response.data.data;
      throw new Error(response.data.message || "Failed to list repositories");
    } catch (error) {
      if (isDemoSession()) return mockStore.getRepositories();
      throw new Error(extractErrorMessage(error, "Failed to list repositories"));
    }
  },

  async getById(id: string): Promise<Repository> {
    if (isDemoSession()) {
      const fallback = mockStore.getRepositoryById(id);
      if (!fallback) throw new Error("Repository not found");
      return fallback;
    }
    try {
      const response = await api.get<ApiResponse<Repository>>(`/repos/${id}`);
      if (response.data.data) return response.data.data;
      throw new Error(response.data.message || "Repository not found");
    } catch (error) {
      if (isDemoSession()) {
        const fallback = mockStore.getRepositoryById(id);
        if (!fallback) throw new Error("Repository not found");
        return fallback;
      }
      throw new Error(extractErrorMessage(error, "Repository not found"));
    }
  },

  async create(payload: CreateRepositoryPayload): Promise<Repository> {
    if (isDemoSession()) {
      return mockStore.createRepository(payload);
    }
    try {
      const response = await api.post<ApiResponse<Repository>>("/repos", payload);
      if (response.data.data) return response.data.data;
      throw new Error(response.data.message || "Failed to create repository");
    } catch (error) {
      if (isDemoSession()) return mockStore.createRepository(payload);
      throw new Error(extractErrorMessage(error, "Failed to create repository"));
    }
  },

  async update(id: string, payload: UpdateRepositoryPayload): Promise<Repository> {
    if (isDemoSession()) {
      return mockStore.updateRepository(id, payload);
    }
    try {
      const response = await api.put<ApiResponse<Repository>>(`/repos/${id}`, payload);
      if (response.data.data) return response.data.data;
      throw new Error(response.data.message || "Failed to update repository");
    } catch (error) {
      if (isDemoSession()) return mockStore.updateRepository(id, payload);
      throw new Error(extractErrorMessage(error, "Failed to update repository"));
    }
  },

  async delete(id: string): Promise<void> {
    if (isDemoSession()) {
      mockStore.deleteRepository(id);
      return;
    }
    try {
      await api.delete<ApiResponse>(`/repos/${id}`);
    } catch (error) {
      if (isDemoSession()) {
        mockStore.deleteRepository(id);
        return;
      }
      throw new Error(extractErrorMessage(error, "Failed to delete repository"));
    }
  },

  async getMembers(id: string): Promise<RepositoryMember[]> {
    if (isDemoSession()) {
      return mockStore.getRepositoryMembers(id);
    }
    try {
      const response = await api.get<ApiResponse<RepositoryMember[]>>(`/repos/${id}/members`);
      if (response.data.data) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch members");
    } catch (error) {
      if (isDemoSession()) return mockStore.getRepositoryMembers(id);
      throw new Error(extractErrorMessage(error, "Failed to fetch members"));
    }
  },

  async addMember(
    id: string,
    username: string,
    role: "CONTRIBUTOR" | "VIEWER"
  ): Promise<RepositoryMember> {
    if (isDemoSession()) {
      return mockStore.addRepositoryMember(id, username, role);
    }
    try {
      const response = await api.post<ApiResponse<RepositoryMember>>(`/repos/${id}/members`, {
        username,
        role,
      });
      if (response.data.data) return response.data.data;
      throw new Error(response.data.message || "Failed to add member");
    } catch (error) {
      if (isDemoSession()) return mockStore.addRepositoryMember(id, username, role);
      throw new Error(extractErrorMessage(error, "Failed to add collaborator"));
    }
  },

  async removeMember(id: string, memberId: string): Promise<void> {
    if (isDemoSession()) {
      mockStore.removeRepositoryMember(id, memberId);
      return;
    }
    try {
      await api.delete<ApiResponse>(`/repos/${id}/members/${memberId}`);
    } catch (error) {
      if (isDemoSession()) {
        mockStore.removeRepositoryMember(id, memberId);
        return;
      }
      throw new Error(extractErrorMessage(error, "Failed to remove member"));
    }
  },

  async getLanguages(id: string): Promise<{ name: string; color: string; bytes: number; percentage: number }[]> {
    try {
      const response = await api.get<ApiResponse<{ name: string; color: string; bytes: number; percentage: number }[]>>(
        `/repos/${id}/languages`
      );
      if (response.data.data) return response.data.data;
      return [];
    } catch {
      return [];
    }
  },
};
