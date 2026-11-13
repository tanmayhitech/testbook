import { api, extractErrorMessage } from "./api.js";
import { ApiResponse } from "../types/api.types.js";
import { getStoredToken } from "../lib/auth-storage.js";
import { mockStore } from "../mock/mockStore.js";
import {
  Branch,
  FileItem,
  Commit,
  Issue,
  PullRequest,
  ActivityItem,
  UserProfile,
  ReviewStatus,
} from "../types/vcs.types.js";

const isDemoSession = (): boolean => {
  const token = getStoredToken();
  return Boolean(token && token.startsWith("mock_"));
};

class VcsService {
  // Branches
  async getBranches(repoId: string): Promise<Branch[]> {
    if (isDemoSession()) {
      return mockStore.getBranches(repoId);
    }
    try {
      const res = await api.get<ApiResponse<Branch[]>>(`/repos/${repoId}/branches`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch branches");
    } catch (error) {
      if (isDemoSession()) return mockStore.getBranches(repoId);
      throw new Error(extractErrorMessage(error, "Failed to fetch branches"));
    }
  }

  async createBranch(repoId: string, name: string): Promise<Branch> {
    if (isDemoSession()) {
      return mockStore.createBranch(repoId, name);
    }
    try {
      const res = await api.post<ApiResponse<Branch>>(`/repos/${repoId}/branches`, { name });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to create branch");
    } catch (error) {
      if (isDemoSession()) return mockStore.createBranch(repoId, name);
      throw new Error(extractErrorMessage(error, "Failed to create branch"));
    }
  }

  async deleteBranch(repoId: string, branchName: string): Promise<void> {
    if (isDemoSession()) {
      mockStore.deleteBranch(repoId, branchName);
      return;
    }
    try {
      await api.delete<ApiResponse>(`/repos/${repoId}/branches/${encodeURIComponent(branchName)}`);
    } catch (error) {
      if (isDemoSession()) {
        mockStore.deleteBranch(repoId, branchName);
        return;
      }
      throw new Error(extractErrorMessage(error, "Failed to delete branch"));
    }
  }

  // Files
  async getFiles(repoId: string, branch = "main"): Promise<FileItem[]> {
    if (isDemoSession()) {
      return mockStore.getFiles(repoId, branch);
    }
    try {
      const res = await api.get<ApiResponse<FileItem[]>>(`/repos/${repoId}/files?branch=${encodeURIComponent(branch)}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch files");
    } catch (error) {
      if (isDemoSession()) return mockStore.getFiles(repoId, branch);
      throw new Error(extractErrorMessage(error, "Failed to fetch files"));
    }
  }

  async getFileContent(repoId: string, branch: string, path: string): Promise<FileItem | undefined> {
    if (isDemoSession()) {
      return mockStore.getFileContent(repoId, branch, path);
    }
    try {
      const res = await api.get<ApiResponse<FileItem>>(
        `/repos/${repoId}/files/content?branch=${encodeURIComponent(branch)}&path=${encodeURIComponent(path)}`
      );
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch file content");
    } catch (error) {
      if (isDemoSession()) return mockStore.getFileContent(repoId, branch, path);
      throw new Error(extractErrorMessage(error, "Failed to fetch file content"));
    }
  }

  async saveFile(
    repoId: string,
    branch: string,
    path: string,
    content: string,
    commitMessage: string
  ): Promise<{ file: FileItem; commit: Commit }> {
    if (isDemoSession()) {
      return mockStore.saveFile(repoId, branch, path, content, commitMessage);
    }
    try {
      const res = await api.post<ApiResponse<{ file: FileItem; commit: Commit }>>(
        `/repos/${repoId}/files`,
        { branch, path, content, commitMessage }
      );
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to save file");
    } catch (error) {
      if (isDemoSession()) return mockStore.saveFile(repoId, branch, path, content, commitMessage);
      throw new Error(extractErrorMessage(error, "Failed to save file"));
    }
  }

  async deleteFile(
    repoId: string,
    branch: string,
    path: string,
    commitMessage: string
  ): Promise<void> {
    if (isDemoSession()) {
      mockStore.deleteFile(repoId, branch, path, commitMessage);
      return;
    }
    try {
      await api.delete<ApiResponse>(`/repos/${repoId}/files`, {
        data: { branch, path, commitMessage },
      });
    } catch (error) {
      if (isDemoSession()) {
        mockStore.deleteFile(repoId, branch, path, commitMessage);
        return;
      }
      throw new Error(extractErrorMessage(error, "Failed to delete file"));
    }
  }

  // Commits
  async getCommits(repoId: string, branch?: string): Promise<Commit[]> {
    if (isDemoSession()) {
      return mockStore.getCommits(repoId, branch);
    }
    try {
      const query = branch ? `?branch=${encodeURIComponent(branch)}` : "";
      const res = await api.get<ApiResponse<Commit[]>>(`/repos/${repoId}/commits${query}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch commits");
    } catch (error) {
      if (isDemoSession()) return mockStore.getCommits(repoId, branch);
      throw new Error(extractErrorMessage(error, "Failed to fetch commits"));
    }
  }

  async getCommitBySha(repoId: string, sha: string): Promise<Commit | undefined> {
    if (isDemoSession()) {
      return mockStore.getCommitBySha(repoId, sha);
    }
    try {
      const res = await api.get<ApiResponse<Commit>>(`/repos/${repoId}/commits/${encodeURIComponent(sha)}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch commit");
    } catch (error) {
      if (isDemoSession()) return mockStore.getCommitBySha(repoId, sha);
      throw new Error(extractErrorMessage(error, "Failed to fetch commit"));
    }
  }

  // Issues
  async getIssues(repoId: string, statusFilter?: "ALL" | "OPEN" | "CLOSED"): Promise<Issue[]> {
    if (isDemoSession()) {
      return mockStore.getIssues(repoId, statusFilter);
    }
    try {
      const query = statusFilter && statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await api.get<ApiResponse<Issue[]>>(`/repos/${repoId}/issues${query}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch issues");
    } catch (error) {
      if (isDemoSession()) return mockStore.getIssues(repoId, statusFilter);
      throw new Error(extractErrorMessage(error, "Failed to fetch issues"));
    }
  }

  async getIssueByNumber(repoId: string, issueNumber: number): Promise<Issue | undefined> {
    if (isDemoSession()) {
      return mockStore.getIssueByNumber(repoId, issueNumber);
    }
    try {
      const res = await api.get<ApiResponse<Issue>>(`/repos/${repoId}/issues/${issueNumber}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch issue");
    } catch (error) {
      if (isDemoSession()) return mockStore.getIssueByNumber(repoId, issueNumber);
      throw new Error(extractErrorMessage(error, "Failed to fetch issue"));
    }
  }

  async createIssue(
    repoId: string,
    title: string,
    description: string,
    labels?: string[]
  ): Promise<Issue> {
    if (isDemoSession()) {
      return mockStore.createIssue(repoId, title, description, labels);
    }
    try {
      const res = await api.post<ApiResponse<Issue>>(`/repos/${repoId}/issues`, {
        title,
        description,
        labels,
      });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to create issue");
    } catch (error) {
      if (isDemoSession()) return mockStore.createIssue(repoId, title, description, labels);
      throw new Error(extractErrorMessage(error, "Failed to create issue"));
    }
  }

  async addIssueComment(repoId: string, issueNumber: number, content: string): Promise<Issue> {
    if (isDemoSession()) {
      return mockStore.addIssueComment(repoId, issueNumber, content);
    }
    try {
      const res = await api.post<ApiResponse<Issue>>(`/repos/${repoId}/issues/${issueNumber}/comments`, {
        content,
      });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to add comment");
    } catch (error) {
      if (isDemoSession()) return mockStore.addIssueComment(repoId, issueNumber, content);
      throw new Error(extractErrorMessage(error, "Failed to add comment"));
    }
  }

  async updateIssueStatus(
    repoId: string,
    issueNumber: number,
    status: "OPEN" | "CLOSED"
  ): Promise<Issue> {
    if (isDemoSession()) {
      return mockStore.updateIssueStatus(repoId, issueNumber, status);
    }
    try {
      const res = await api.patch<ApiResponse<Issue>>(`/repos/${repoId}/issues/${issueNumber}/status`, {
        status,
      });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to update issue status");
    } catch (error) {
      if (isDemoSession()) return mockStore.updateIssueStatus(repoId, issueNumber, status);
      throw new Error(extractErrorMessage(error, "Failed to update issue status"));
    }
  }

  // Pull Requests
  async getPullRequests(
    repoId: string,
    statusFilter?: "ALL" | "OPEN" | "MERGED" | "CLOSED"
  ): Promise<PullRequest[]> {
    if (isDemoSession()) {
      return mockStore.getPullRequests(repoId, statusFilter);
    }
    try {
      const query = statusFilter && statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await api.get<ApiResponse<PullRequest[]>>(`/repos/${repoId}/pulls${query}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch pull requests");
    } catch (error) {
      if (isDemoSession()) return mockStore.getPullRequests(repoId, statusFilter);
      throw new Error(extractErrorMessage(error, "Failed to fetch pull requests"));
    }
  }

  async getPullRequestByNumber(
    repoId: string,
    prNumber: number
  ): Promise<PullRequest | undefined> {
    if (isDemoSession()) {
      return mockStore.getPullRequestByNumber(repoId, prNumber);
    }
    try {
      const res = await api.get<ApiResponse<PullRequest>>(`/repos/${repoId}/pulls/${prNumber}`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch pull request");
    } catch (error) {
      if (isDemoSession()) return mockStore.getPullRequestByNumber(repoId, prNumber);
      throw new Error(extractErrorMessage(error, "Failed to fetch pull request"));
    }
  }

  async createPullRequest(
    repoId: string,
    payload: { title: string; description: string; sourceBranch: string; targetBranch: string }
  ): Promise<PullRequest> {
    if (isDemoSession()) {
      return mockStore.createPullRequest(repoId, payload);
    }
    try {
      const res = await api.post<ApiResponse<PullRequest>>(`/repos/${repoId}/pulls`, payload);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to create pull request");
    } catch (error) {
      if (isDemoSession()) return mockStore.createPullRequest(repoId, payload);
      throw new Error(extractErrorMessage(error, "Failed to create pull request"));
    }
  }

  async addPullRequestReview(
    repoId: string,
    prNumber: number,
    review: { status: ReviewStatus; comment?: string }
  ): Promise<PullRequest> {
    if (isDemoSession()) {
      return mockStore.addPullRequestReview(repoId, prNumber, review);
    }
    try {
      const res = await api.post<ApiResponse<PullRequest>>(`/repos/${repoId}/pulls/${prNumber}/reviews`, review);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to add review");
    } catch (error) {
      if (isDemoSession()) return mockStore.addPullRequestReview(repoId, prNumber, review);
      throw new Error(extractErrorMessage(error, "Failed to add review"));
    }
  }

  async addPullRequestComment(
    repoId: string,
    prNumber: number,
    content: string
  ): Promise<PullRequest> {
    if (isDemoSession()) {
      return mockStore.addPullRequestComment(repoId, prNumber, content);
    }
    try {
      const res = await api.post<ApiResponse<PullRequest>>(`/repos/${repoId}/pulls/${prNumber}/comments`, {
        content,
      });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to add comment");
    } catch (error) {
      if (isDemoSession()) return mockStore.addPullRequestComment(repoId, prNumber, content);
      throw new Error(extractErrorMessage(error, "Failed to add comment"));
    }
  }

  async mergePullRequest(repoId: string, prNumber: number): Promise<PullRequest> {
    if (isDemoSession()) {
      return mockStore.mergePullRequest(repoId, prNumber);
    }
    try {
      const res = await api.post<ApiResponse<PullRequest>>(`/repos/${repoId}/pulls/${prNumber}/merge`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to merge pull request");
    } catch (error) {
      if (isDemoSession()) return mockStore.mergePullRequest(repoId, prNumber);
      throw new Error(extractErrorMessage(error, "Failed to merge pull request"));
    }
  }

  async closePullRequest(repoId: string, prNumber: number): Promise<PullRequest> {
    if (isDemoSession()) {
      return mockStore.closePullRequest(repoId, prNumber);
    }
    try {
      const res = await api.post<ApiResponse<PullRequest>>(`/repos/${repoId}/pulls/${prNumber}/close`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to close pull request");
    } catch (error) {
      if (isDemoSession()) return mockStore.closePullRequest(repoId, prNumber);
      throw new Error(extractErrorMessage(error, "Failed to close pull request"));
    }
  }

  // Activity Feed
  async getActivities(repoId?: string): Promise<ActivityItem[]> {
    if (isDemoSession()) {
      return mockStore.getActivities(repoId);
    }
    try {
      const path = repoId ? `/repos/${repoId}/activities` : "/activities";
      const res = await api.get<ApiResponse<ActivityItem[]>>(path);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch activities");
    } catch (error) {
      if (isDemoSession()) return mockStore.getActivities(repoId);
      throw new Error(extractErrorMessage(error, "Failed to fetch activities"));
    }
  }

  // User Profile
  async getUserProfile(username?: string): Promise<UserProfile> {
    if (isDemoSession()) {
      return mockStore.getUserProfile(username);
    }
    try {
      const path = username ? `/users/${encodeURIComponent(username)}` : "/users/profile";
      const res = await api.get<ApiResponse<UserProfile>>(path);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to fetch profile");
    } catch (error) {
      if (isDemoSession()) return mockStore.getUserProfile(username);
      throw new Error(extractErrorMessage(error, "Failed to fetch profile"));
    }
  }

  async updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    if (isDemoSession()) {
      return mockStore.updateUserProfile(payload);
    }
    try {
      const res = await api.patch<ApiResponse<UserProfile>>("/users/profile", payload);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || "Failed to update profile");
    } catch (error) {
      if (isDemoSession()) return mockStore.updateUserProfile(payload);
      throw new Error(extractErrorMessage(error, "Failed to update profile"));
    }
  }
}

export const vcsService = new VcsService();
