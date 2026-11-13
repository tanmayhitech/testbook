import { prisma } from "../config/prisma.js";
import { ActivityType, MemberRole, PullRequestStatus, RepositoryVisibility } from "../generated/prisma/enums.js";
import { copyBranchStorage } from "../utils/storage.js";
import { getUserRepositoryRole } from "./repository.service.js";

export const getBranches = async (repositoryId: string, userId?: string) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { id: true, visibility: true },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  if (repo.visibility === RepositoryVisibility.PRIVATE) {
    if (!userId) {
      throw new Error("Unauthorized: Repository is private");
    }
    const role = await getUserRepositoryRole(repositoryId, userId);
    if (!role) {
      throw new Error("Access denied: You do not have access to this repository");
    }
  }

  const branches = await prisma.branch.findMany({
    where: { repositoryId },
    include: {
      commits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, createdAt: true },
      },
      _count: {
        select: { commits: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return branches.map((b) => {
    const latestCommit = b.commits[0];
    return {
      id: b.id,
      repositoryId: b.repositoryId,
      name: b.name,
      isDefault: b.name === "main",
      createdAt: b.createdAt.toISOString(),
      updatedAt: latestCommit ? latestCommit.createdAt.toISOString() : b.createdAt.toISOString(),
      lastCommitSha: latestCommit ? latestCommit.id : "initial",
      commitCount: b._count.commits,
    };
  });
};

export const createBranch = async (
  repositoryId: string,
  userId: string,
  name: string,
  sourceBranchName = "main"
) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Branch name is required");
  }

  // Branch names cannot have spaces or special characters
  if (!/^[a-zA-Z0-9_\-\.\/]+$/.test(trimmedName)) {
    throw new Error("Invalid branch name. Only letters, numbers, hyphens, underscores, slashes, and dots are allowed.");
  }

  const role = await getUserRepositoryRole(repositoryId, userId);
  if (!role || (role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR)) {
    throw new Error("Unauthorized: Only owners and contributors can create branches");
  }

  const existing = await prisma.branch.findUnique({
    where: {
      repositoryId_name: {
        repositoryId,
        name: trimmedName,
      },
    },
  });

  if (existing) {
    throw new Error(`Branch '${trimmedName}' already exists`);
  }

  const newBranch = await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        repositoryId,
        name: trimmedName,
      },
    });

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.BRANCH_CREATED,
        message: `Created branch ${trimmedName} from ${sourceBranchName}`,
      },
    });

    return branch;
  });

  // Inherit files on disk from source branch to new branch
  await copyBranchStorage(repositoryId, sourceBranchName, trimmedName);

  return {
    id: newBranch.id,
    repositoryId: newBranch.repositoryId,
    name: newBranch.name,
    isDefault: newBranch.name === "main",
    createdAt: newBranch.createdAt.toISOString(),
    updatedAt: newBranch.createdAt.toISOString(),
    lastCommitSha: "initial",
    commitCount: 0,
  };
};

export const deleteBranch = async (repositoryId: string, userId: string, branchName: string) => {
  if (branchName === "main") {
    throw new Error("Cannot delete default branch 'main'");
  }

  const role = await getUserRepositoryRole(repositoryId, userId);
  if (!role || (role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR)) {
    throw new Error("Unauthorized: Only owners and contributors can delete branches");
  }

  const branch = await prisma.branch.findUnique({
    where: {
      repositoryId_name: {
        repositoryId,
        name: branchName,
      },
    },
  });

  if (!branch) {
    throw new Error(`Branch '${branchName}' not found`);
  }

  // Prevent deleting branches with open pull requests
  const activePr = await prisma.pullRequest.findFirst({
    where: {
      repositoryId,
      status: {
        in: [PullRequestStatus.OPEN, PullRequestStatus.APPROVED, PullRequestStatus.CHANGES_REQUESTED],
      },
      OR: [{ sourceBranchId: branch.id }, { targetBranchId: branch.id }],
    },
    select: { id: true, title: true },
  });

  if (activePr) {
    throw new Error(
      `Cannot delete branch '${branchName}': it is part of active pull request "${activePr.title}"`
    );
  }

  await prisma.branch.delete({
    where: {
      id: branch.id,
    },
  });

  return { message: `Branch '${branchName}' deleted successfully` };
};
