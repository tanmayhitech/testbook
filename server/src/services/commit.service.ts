import { prisma } from "../config/prisma.js";
import { RepositoryVisibility } from "../generated/prisma/enums.js";
import { readStorageFile } from "../utils/storage.js";
import { computeFileDiff, type FileDiff } from "../utils/diff.js";
import { getUserRepositoryRole } from "./repository.service.js";

export const getCommits = async (repositoryId: string, branchName?: string, userId?: string) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { visibility: true },
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
      throw new Error("Access denied: You do not have permission to view this repository");
    }
  }

  let branchId: string | undefined;
  if (branchName) {
    const branch = await prisma.branch.findUnique({
      where: {
        repositoryId_name: {
          repositoryId,
          name: branchName,
        },
      },
      select: { id: true },
    });
    if (branch) {
      branchId = branch.id;
    }
  }

  const commits = await prisma.commit.findMany({
    where: {
      repositoryId,
      ...(branchId ? { branchId } : {}),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      },
      branch: {
        select: { name: true },
      },
      files: {
        include: {
          file: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return commits.map((c) => {
    return {
      id: c.id,
      sha: c.id,
      repositoryId: c.repositoryId,
      branch: c.branch.name,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        username: c.author.username,
        email: c.author.email,
        avatarUrl: c.author.avatarUrl,
        bio: c.author.bio,
        createdAt: c.author.createdAt.toISOString(),
      },
      stats: {
        filesChanged: c.files.length || 1,
        additions: 12,
        deletions: 2,
      },
    };
  });
};

export const getCommitBySha = async (repositoryId: string, sha: string, userId?: string) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { visibility: true },
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
      throw new Error("Access denied: You do not have permission to view this repository");
    }
  }

  const commit = await prisma.commit.findUnique({
    where: { id: sha },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      },
      branch: {
        select: { name: true },
      },
      files: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!commit || commit.repositoryId !== repositoryId) {
    throw new Error(`Commit '${sha}' not found`);
  }

  const diffs: FileDiff[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const cf of commit.files) {
    const content = await readStorageFile(repositoryId, commit.branch.name, cf.file.path);
    const diff = computeFileDiff(
      cf.file.path,
      cf.changeType === "ADDED" ? null : "",
      cf.changeType === "DELETED" ? null : content ?? ""
    );
    diffs.push(diff);
    totalAdditions += diff.additions;
    totalDeletions += diff.deletions;
  }

  return {
    id: commit.id,
    sha: commit.id,
    repositoryId: commit.repositoryId,
    branch: commit.branch.name,
    message: commit.message,
    status: commit.status,
    createdAt: commit.createdAt.toISOString(),
    author: {
      id: commit.author.id,
      username: commit.author.username,
      email: commit.author.email,
      avatarUrl: commit.author.avatarUrl,
      bio: commit.author.bio,
      createdAt: commit.author.createdAt.toISOString(),
    },
    diffs,
    stats: {
      filesChanged: commit.files.length,
      additions: totalAdditions,
      deletions: totalDeletions,
    },
  };
};
