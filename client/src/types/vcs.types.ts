import { User } from "./auth.types.js";

export type BranchRole = "DEFAULT" | "ACTIVE" | "ARCHIVED";

export interface Branch {
  id: string;
  repositoryId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  lastCommitSha: string;
  commitCount: number;
}

export type FileChangeType = "ADDED" | "MODIFIED" | "DELETED";

export interface FileItem {
  id: string;
  repositoryId: string;
  branch: string;
  path: string;
  name: string;
  type: "file" | "dir";
  size: number;
  content?: string;
  mimeType?: string;
  updatedAt: string;
  lastCommitMessage?: string;
}

export interface DiffChunk {
  oldLineNumber?: number;
  newLineNumber?: number;
  type: "add" | "delete" | "normal";
  content: string;
}

export interface FileDiff {
  path: string;
  changeType: FileChangeType;
  additions: number;
  deletions: number;
  chunks: DiffChunk[];
}

export interface Commit {
  id: string;
  sha: string;
  repositoryId: string;
  branch: string;
  message: string;
  status: "ACTIVE" | "REVERTED";
  createdAt: string;
  author: User;
  parentSha?: string;
  diffs?: FileDiff[];
  stats?: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

export type IssueStatus = "OPEN" | "CLOSED";

export interface IssueComment {
  id: string;
  issueId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Issue {
  id: string;
  number: number;
  repositoryId: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  author: User;
  assignee?: User | null;
  labels: string[];
  commentsCount: number;
  comments: IssueComment[];
}

export type PullRequestStatus = "OPEN" | "MERGED" | "CLOSED";
export type ReviewStatus = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED";

export interface ReviewComment {
  id: string;
  author: User;
  filePath: string;
  lineNumber: number;
  content: string;
  createdAt: string;
}

export interface PullRequestReview {
  id: string;
  pullRequestId: string;
  reviewer: User;
  status: ReviewStatus;
  comment?: string;
  createdAt: string;
}

export interface PullRequestComment {
  id: string;
  pullRequestId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface PullRequest {
  id: string;
  number: number;
  repositoryId: string;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  status: PullRequestStatus;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string | null;
  closedAt?: string | null;
  author: User;
  reviews: PullRequestReview[];
  comments: PullRequestComment[];
  reviewComments: ReviewComment[];
  commits: Commit[];
  diffs: FileDiff[];
}

export interface ActivityItem {
  id: string;
  repositoryId: string;
  repositoryName: string;
  user: User;
  type:
    | "REPOSITORY_CREATED"
    | "BRANCH_CREATED"
    | "COMMIT_CREATED"
    | "ISSUE_CREATED"
    | "ISSUE_CLOSED"
    | "PULL_REQUEST_CREATED"
    | "PULL_REQUEST_MERGED"
    | "REVIEW_SUBMITTED";
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface UserProfile extends User {
  headline?: string;
  institution?: string;
  location?: string;
  website?: string;
  githubUsername?: string;
  skills: string[];
  repositoriesCount: number;
  starsReceived: number;
  contributionsThisYear: number;
}
