import path from "path";
import { prisma } from "../config/prisma.js";
import { ActivityType, FileChangeType, MemberRole, RepositoryVisibility } from "../generated/prisma/enums.js";
import { computeFileDiff } from "../utils/diff.js";
import {
  deleteStorageFile,
  readStorageFile,
  writeStorageFile,
} from "../utils/storage.js";
import { getUserRepositoryRole } from "./repository.service.js";

const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
    case ".tsx":
      return "text/typescript";
    case ".js":
    case ".jsx":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".md":
      return "text/markdown";
    case ".py":
      return "text/x-python";
    case ".sql":
      return "text/x-sql";
    default:
      return "text/plain";
  }
};

export const getFiles = async (repositoryId: string, branchName = "main", userId?: string) => {
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

  const files = await prisma.file.findMany({
    where: { repositoryId },
    include: {
      commits: {
        include: {
          commit: {
            select: {
              id: true,
              message: true,
              createdAt: true,
              branch: { select: { name: true } },
            },
          },
        },
        orderBy: { commit: { createdAt: "desc" } },
        take: 1,
      },
    },
    orderBy: { path: "asc" },
  });

  return files.map((f) => {
    const latestCommit = f.commits[0]?.commit;
    const fileName = path.basename(f.path);
    return {
      id: f.id,
      repositoryId: f.repositoryId,
      branch: branchName,
      path: f.path,
      name: fileName,
      type: "file" as const,
      size: f.size,
      mimeType: f.mimeType ?? getMimeType(f.path),
      updatedAt: f.updatedAt.toISOString(),
      lastCommitMessage: latestCommit?.message ?? "Update file",
    };
  });
};

export const getFileContent = async (
  repositoryId: string,
  branchName: string,
  filePath: string,
  userId?: string
) => {
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

  const normalizedPath = filePath.replace(/^[\/\\]+/, "").replace(/\\/g, "/");

  const file = await prisma.file.findUnique({
    where: {
      repositoryId_path: {
        repositoryId,
        path: normalizedPath,
      },
    },
    include: {
      commits: {
        include: {
          commit: {
            select: {
              message: true,
            },
          },
        },
        orderBy: { commit: { createdAt: "desc" } },
        take: 1,
      },
    },
  });

  const content = await readStorageFile(repositoryId, branchName, normalizedPath);

  if (content === null && !file) {
    throw new Error(`File '${filePath}' not found`);
  }

  const fileName = path.basename(normalizedPath);
  return {
    id: file?.id ?? `file_${normalizedPath}`,
    repositoryId,
    branch: branchName,
    path: normalizedPath,
    name: fileName,
    type: "file" as const,
    size: content ? Buffer.byteLength(content, "utf-8") : (file?.size ?? 0),
    content: content ?? "",
    mimeType: file?.mimeType ?? getMimeType(normalizedPath),
    updatedAt: file?.updatedAt.toISOString() ?? new Date().toISOString(),
    lastCommitMessage: file?.commits[0]?.commit.message ?? "Update file",
  };
};

export const saveFile = async (
  repositoryId: string,
  userId: string,
  branchName: string,
  filePath: string,
  content: string,
  commitMessage: string
) => {
  const role = await getUserRepositoryRole(repositoryId, userId);
  if (!role || (role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR)) {
    throw new Error("Unauthorized: Only owners and contributors can write files");
  }

  let branch = await prisma.branch.findUnique({
    where: {
      repositoryId_name: {
        repositoryId,
        name: branchName,
      },
    },
  });

  if (!branch) {
    if (branchName === "main") {
      branch = await prisma.branch.create({
        data: {
          repositoryId,
          name: "main",
        },
      });
    } else {
      throw new Error(`Branch '${branchName}' does not exist`);
    }
  }

  const normalizedPath = filePath.replace(/^[\/\\]+/, "").replace(/\\/g, "/");
  const oldContent = await readStorageFile(repositoryId, branchName, normalizedPath);
  const isNew = oldContent === null;

  // Write content to storage
  const storagePath = await writeStorageFile(repositoryId, branchName, normalizedPath, content);
  const size = Buffer.byteLength(content, "utf-8");
  const mimeType = getMimeType(normalizedPath);
  const msg = commitMessage.trim() || (isNew ? `Add ${normalizedPath}` : `Update ${normalizedPath}`);

  const diff = computeFileDiff(normalizedPath, oldContent, content);

  const { fileRecord, commitRecord, authorUser } = await prisma.$transaction(async (tx) => {
    const file = await tx.file.upsert({
      where: {
        repositoryId_path: {
          repositoryId,
          path: normalizedPath,
        },
      },
      update: {
        size,
        mimeType,
        storagePath,
        updatedAt: new Date(),
      },
      create: {
        repositoryId,
        path: normalizedPath,
        storagePath,
        size,
        mimeType,
      },
    });

    const commit = await tx.commit.create({
      data: {
        repositoryId,
        branchId: branch!.id,
        authorId: userId,
        message: msg,
      },
    });

    await tx.commitFile.create({
      data: {
        commitId: commit.id,
        fileId: file.id,
        changeType: isNew ? FileChangeType.ADDED : FileChangeType.MODIFIED,
      },
    });

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.COMMIT_CREATED,
        message: `Committed '${msg}' to ${branchName}`,
      },
    });

    const author = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    return { fileRecord: file, commitRecord: commit, authorUser: author };
  });

  return {
    file: {
      id: fileRecord.id,
      repositoryId: fileRecord.repositoryId,
      branch: branchName,
      path: fileRecord.path,
      name: path.basename(fileRecord.path),
      type: "file" as const,
      size: fileRecord.size,
      content,
      mimeType: fileRecord.mimeType ?? mimeType,
      updatedAt: fileRecord.updatedAt.toISOString(),
      lastCommitMessage: commitRecord.message,
    },
    commit: {
      id: commitRecord.id,
      sha: commitRecord.id,
      repositoryId,
      branch: branchName,
      message: commitRecord.message,
      status: commitRecord.status,
      createdAt: commitRecord.createdAt.toISOString(),
      author: {
        id: authorUser?.id ?? userId,
        username: authorUser?.username ?? "developer",
        email: authorUser?.email ?? "dev@testbook.io",
        avatarUrl: authorUser?.avatarUrl ?? null,
        bio: authorUser?.bio ?? null,
        createdAt: authorUser?.createdAt.toISOString() ?? new Date().toISOString(),
      },
      diffs: [diff],
      stats: {
        filesChanged: 1,
        additions: diff.additions,
        deletions: diff.deletions,
      },
    },
  };
};

export const deleteFile = async (
  repositoryId: string,
  userId: string,
  branchName: string,
  filePath: string,
  commitMessage: string
) => {
  const role = await getUserRepositoryRole(repositoryId, userId);
  if (!role || (role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR)) {
    throw new Error("Unauthorized: Only owners and contributors can delete files");
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
    throw new Error(`Branch '${branchName}' does not exist`);
  }

  const normalizedPath = filePath.replace(/^[\/\\]+/, "").replace(/\\/g, "/");
  const oldContent = await readStorageFile(repositoryId, branchName, normalizedPath);
  await deleteStorageFile(repositoryId, branchName, normalizedPath);

  const file = await prisma.file.findUnique({
    where: {
      repositoryId_path: {
        repositoryId,
        path: normalizedPath,
      },
    },
  });

  const msg = commitMessage.trim() || `Delete ${normalizedPath}`;
  const diff = computeFileDiff(normalizedPath, oldContent, null);

  await prisma.$transaction(async (tx) => {
    const commit = await tx.commit.create({
      data: {
        repositoryId,
        branchId: branch.id,
        authorId: userId,
        message: msg,
      },
    });

    if (file) {
      await tx.commitFile.create({
        data: {
          commitId: commit.id,
          fileId: file.id,
          changeType: FileChangeType.DELETED,
        },
      });

      await tx.file.delete({
        where: { id: file.id },
      });
    }

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.COMMIT_CREATED,
        message: `Deleted file ${normalizedPath} on ${branchName}`,
      },
    });
  });

  return { message: "File deleted successfully", diff };
};
