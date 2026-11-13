import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vcsService } from "../services/vcs.service.js";
import { ReviewStatus, UserProfile } from "../types/vcs.types.js";
import { REPOSITORIES_QUERY_KEY, repositoryDetailQueryKey } from "./useRepositories.js";

export const vcsQueryKeys = {
  branches: (repoId: string) => ["vcs", repoId, "branches"],
  files: (repoId: string, branch: string) => ["vcs", repoId, "files", branch],
  fileContent: (repoId: string, branch: string, path: string) => [
    "vcs",
    repoId,
    "file",
    branch,
    path,
  ],
  commits: (repoId: string, branch?: string) => ["vcs", repoId, "commits", branch || "all"],
  commitDetail: (repoId: string, sha: string) => ["vcs", repoId, "commit", sha],
  issues: (repoId: string, status?: string) => ["vcs", repoId, "issues", status || "all"],
  issueDetail: (repoId: string, number: number) => ["vcs", repoId, "issue", number],
  pulls: (repoId: string, status?: string) => ["vcs", repoId, "pulls", status || "all"],
  pullDetail: (repoId: string, number: number) => ["vcs", repoId, "pull", number],
  activities: (repoId?: string) => ["vcs", "activities", repoId || "all"],
  profile: (username?: string) => ["vcs", "profile", username || "current"],
};

// Branches
export const useBranches = (repoId: string) => {
  return useQuery({
    queryKey: vcsQueryKeys.branches(repoId),
    queryFn: () => vcsService.getBranches(repoId),
    enabled: Boolean(repoId),
  });
};

export const useCreateBranch = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => vcsService.createBranch(repoId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.branches(repoId) });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
      queryClient.invalidateQueries({ queryKey: REPOSITORIES_QUERY_KEY });
    },
  });
};

export const useDeleteBranch = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => vcsService.deleteBranch(repoId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.branches(repoId) });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
    },
  });
};

// Files
export const useFiles = (repoId: string, branch = "main") => {
  return useQuery({
    queryKey: vcsQueryKeys.files(repoId, branch),
    queryFn: () => vcsService.getFiles(repoId, branch),
    enabled: Boolean(repoId),
  });
};

export const useFileContent = (repoId: string, branch: string, path: string) => {
  return useQuery({
    queryKey: vcsQueryKeys.fileContent(repoId, branch, path),
    queryFn: () => vcsService.getFileContent(repoId, branch, path),
    enabled: Boolean(repoId && branch && path),
  });
};

export const useSaveFile = (repoId: string, branch: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      path,
      content,
      commitMessage,
    }: {
      path: string;
      content: string;
      commitMessage: string;
    }) => vcsService.saveFile(repoId, branch, path, content, commitMessage),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.files(repoId, branch) });
      queryClient.invalidateQueries({
        queryKey: vcsQueryKeys.fileContent(repoId, branch, variables.path),
      });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.commits(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
    },
  });
};

export const useDeleteFile = (repoId: string, branch: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ path, commitMessage }: { path: string; commitMessage: string }) =>
      vcsService.deleteFile(repoId, branch, path, commitMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.files(repoId, branch) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.commits(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
    },
  });
};

// Commits
export const useCommits = (repoId: string, branch?: string) => {
  return useQuery({
    queryKey: vcsQueryKeys.commits(repoId, branch),
    queryFn: () => vcsService.getCommits(repoId, branch),
    enabled: Boolean(repoId),
  });
};

export const useCommitDetail = (repoId: string, sha: string) => {
  return useQuery({
    queryKey: vcsQueryKeys.commitDetail(repoId, sha),
    queryFn: () => vcsService.getCommitBySha(repoId, sha),
    enabled: Boolean(repoId && sha),
  });
};

// Issues
export const useIssues = (repoId: string, statusFilter?: "ALL" | "OPEN" | "CLOSED") => {
  return useQuery({
    queryKey: vcsQueryKeys.issues(repoId, statusFilter),
    queryFn: () => vcsService.getIssues(repoId, statusFilter),
    enabled: Boolean(repoId),
  });
};

export const useIssueDetail = (repoId: string, issueNumber: number) => {
  return useQuery({
    queryKey: vcsQueryKeys.issueDetail(repoId, issueNumber),
    queryFn: () => vcsService.getIssueByNumber(repoId, issueNumber),
    enabled: Boolean(repoId && issueNumber),
  });
};

export const useCreateIssue = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
      labels,
    }: {
      title: string;
      description: string;
      labels?: string[];
    }) => vcsService.createIssue(repoId, title, description, labels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.issues(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
    },
  });
};

export const useAddIssueComment = (repoId: string, issueNumber: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => vcsService.addIssueComment(repoId, issueNumber, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.issueDetail(repoId, issueNumber) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.issues(repoId) });
    },
  });
};

export const useUpdateIssueStatus = (repoId: string, issueNumber: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: "OPEN" | "CLOSED") =>
      vcsService.updateIssueStatus(repoId, issueNumber, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.issueDetail(repoId, issueNumber) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.issues(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
    },
  });
};

// Pull Requests
export const usePullRequests = (
  repoId: string,
  statusFilter?: "ALL" | "OPEN" | "MERGED" | "CLOSED"
) => {
  return useQuery({
    queryKey: vcsQueryKeys.pulls(repoId, statusFilter),
    queryFn: () => vcsService.getPullRequests(repoId, statusFilter),
    enabled: Boolean(repoId),
  });
};

export const usePullRequestDetail = (repoId: string, prNumber: number) => {
  return useQuery({
    queryKey: vcsQueryKeys.pullDetail(repoId, prNumber),
    queryFn: () => vcsService.getPullRequestByNumber(repoId, prNumber),
    enabled: Boolean(repoId && prNumber),
  });
};

export const useCreatePullRequest = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      description: string;
      sourceBranch: string;
      targetBranch: string;
    }) => vcsService.createPullRequest(repoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pulls(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
    },
  });
};

export const useSubmitReview = (repoId: string, prNumber: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: { status: ReviewStatus; comment?: string }) =>
      vcsService.addPullRequestReview(repoId, prNumber, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pullDetail(repoId, prNumber) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pulls(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
    },
  });
};

export const useAddPullRequestComment = (repoId: string, prNumber: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => vcsService.addPullRequestComment(repoId, prNumber, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pullDetail(repoId, prNumber) });
    },
  });
};

export const useMergePullRequest = (repoId: string, prNumber: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => vcsService.mergePullRequest(repoId, prNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pullDetail(repoId, prNumber) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pulls(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.files(repoId, "main") });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.commits(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
      queryClient.invalidateQueries({ queryKey: repositoryDetailQueryKey(repoId) });
    },
  });
};

export const useClosePullRequest = (repoId: string, prNumber: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => vcsService.closePullRequest(repoId, prNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pullDetail(repoId, prNumber) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.pulls(repoId) });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.activities() });
    },
  });
};

// Activity Feed
export const useActivities = (repoId?: string) => {
  return useQuery({
    queryKey: vcsQueryKeys.activities(repoId),
    queryFn: () => vcsService.getActivities(repoId),
  });
};

// User Profile
export const useUserProfile = (username?: string) => {
  return useQuery({
    queryKey: vcsQueryKeys.profile(username),
    queryFn: () => vcsService.getUserProfile(username),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserProfile>) => vcsService.updateUserProfile(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: vcsQueryKeys.profile(data.username) });
    },
  });
};
