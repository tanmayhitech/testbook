import { User } from "./auth.types.js";

export type RepositoryVisibility = "PUBLIC" | "PRIVATE";
export type MemberRole = "OWNER" | "CONTRIBUTOR" | "VIEWER";

export interface RepositoryCounts {
  members?: number;
  branches?: number;
  commits?: number;
  issues?: number;
  pullRequests?: number;
  files?: number;
}

export interface BranchSummary {
  id: string;
  name: string;
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string | null;
  visibility: RepositoryVisibility;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  currentUserRole?: MemberRole | null;
  branches?: BranchSummary[];
  counts?: RepositoryCounts;
}

export interface CreateRepositoryPayload {
  name: string;
  description?: string;
  visibility?: RepositoryVisibility;
}

export interface UpdateRepositoryPayload {
  name?: string;
  description?: string;
  visibility?: RepositoryVisibility;
}

export interface RepositoryMember {
  id: string;
  role: MemberRole;
  createdAt: string;
  user: User;
}
