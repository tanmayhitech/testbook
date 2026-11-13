import { prisma } from "../config/prisma.js";
import {
  ActivityType,
  MemberRole,
  PullRequestStatus,
  RepositoryVisibility,
  ReviewStatus,
} from "../generated/prisma/enums.js";
import { computeFileDiff, detectMergeConflict, type FileDiff } from "../utils/diff.js";
import { copyBranchStorage, readStorageFile, writeStorageFile } from "../utils/storage.js";
import { getUserRepositoryRole } from "./repository.service.js";

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  createdAt: user.createdAt.toISOString(),
});

interface PRDiffAndConflict {
  diffs: FileDiff[];
  conflicts: string[];
  commits: Array<{
    id: string;
    sha: string;
    repositoryId: string;
    branch: string;
    message: string;
    status: "ACTIVE" | "REVERTED";
    createdAt: string;
    author: {
      id: string;
      username: string;
      email: string;
      avatarUrl: string | null;
      bio: string | null;
      createdAt: string;
    };
  }>;
}

const computePRDetails = async (
  repositoryId: string,
  sourceBranch: string,
  targetBranch: string,
  sourceBranchId: string
): Promise<PRDiffAndConflict> => {
  // 1. Fetch commits on source branch
  const commits = await prisma.commit.findMany({
    where: {
      repositoryId,
      branchId: sourceBranchId,
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
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCommits = commits.map((c) => ({
    id: c.id,
    sha: c.id,
    repositoryId: c.repositoryId,
    branch: sourceBranch,
    message: c.message,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    author: sanitizeUser(c.author),
  }));

  // 2. Fetch repository files to compare contents
  const files = await prisma.file.findMany({
    where: { repositoryId },
    select: { path: true },
  });

  const diffs: FileDiff[] = [];
  const conflicts: string[] = [];

  for (const f of files) {
    const sourceContent = await readStorageFile(repositoryId, sourceBranch, f.path);
    const targetContent = await readStorageFile(repositoryId, targetBranch, f.path);

    if (sourceContent !== targetContent) {
      const diff = computeFileDiff(f.path, targetContent, sourceContent);
      diffs.push(diff);

      const conflictCheck = detectMergeConflict(targetContent, sourceContent);
      if (conflictCheck.hasConflict) {
        conflicts.push(f.path);
      }
    }
  }

  return {
    diffs,
    conflicts,
    commits: formattedCommits,
  };
};

export const getPullRequests = async (
  repositoryId: string,
  statusFilter?: "ALL" | "OPEN" | "MERGED" | "CLOSED",
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

  const pulls = await prisma.pullRequest.findMany({
    where: {
      repositoryId,
      ...(statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter as PullRequestStatus }
        : {}),
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
      sourceBranch: { select: { name: true, id: true } },
      targetBranch: { select: { name: true, id: true } },
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
              bio: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      comments: {
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
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const results = [];
  for (let index = 0; index < pulls.length; index++) {
    const pr = pulls[index]!;
    const details = await computePRDetails(
      repositoryId,
      pr.sourceBranch.name,
      pr.targetBranch.name,
      pr.sourceBranch.id
    );

    results.push({
      id: pr.id,
      number: index + 1,
      repositoryId: pr.repositoryId,
      title: pr.title,
      description: pr.description ?? "",
      sourceBranch: pr.sourceBranch.name,
      targetBranch: pr.targetBranch.name,
      status: pr.status as "OPEN" | "MERGED" | "CLOSED",
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
      mergedAt: pr.mergedAt?.toISOString() ?? null,
      closedAt: pr.status === "CLOSED" ? pr.updatedAt.toISOString() : null,
      author: sanitizeUser(pr.author),
      hasConflicts: details.conflicts.length > 0,
      conflictFiles: details.conflicts,
      reviews: pr.reviews.map((r) => ({
        id: r.id,
        pullRequestId: r.pullRequestId,
        reviewer: sanitizeUser(r.reviewer),
        status: r.status as "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED",
        comment: r.comment ?? undefined,
        createdAt: r.createdAt.toISOString(),
      })),
      comments: pr.comments.map((c) => ({
        id: c.id,
        pullRequestId: c.pullRequestId,
        author: sanitizeUser(c.author),
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      reviewComments: [],
      commits: details.commits,
      diffs: details.diffs,
    });
  }

  return results;
};

export const getPullRequestByIdOrNumber = async (
  repositoryId: string,
  idOrNumber: string | number,
  userId?: string
) => {
  const allPulls = await getPullRequests(repositoryId, "ALL", userId);
  const numeric = typeof idOrNumber === "number" ? idOrNumber : parseInt(idOrNumber, 10);

  if (!isNaN(numeric)) {
    const found = allPulls.find((p) => p.number === numeric);
    if (found) return found;
  }

  const foundById = allPulls.find((p) => p.id === String(idOrNumber));
  if (foundById) return foundById;

  throw new Error("Pull request not found");
};

export const createPullRequest = async (
  repositoryId: string,
  userId: string,
  payload: {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
  }
) => {
  const role = await getUserRepositoryRole(repositoryId, userId);
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { visibility: true },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  if (repo.visibility === RepositoryVisibility.PRIVATE && !role) {
    throw new Error("Unauthorized: Access denied to private repository");
  }

  if (payload.sourceBranch === payload.targetBranch) {
    throw new Error("Source branch and target branch cannot be the same");
  }

  const source = await prisma.branch.findUnique({
    where: {
      repositoryId_name: {
        repositoryId,
        name: payload.sourceBranch,
      },
    },
  });

  if (!source) {
    throw new Error(`Source branch '${payload.sourceBranch}' does not exist`);
  }

  const target = await prisma.branch.findUnique({
    where: {
      repositoryId_name: {
        repositoryId,
        name: payload.targetBranch,
      },
    },
  });

  if (!target) {
    throw new Error(`Target branch '${payload.targetBranch}' does not exist`);
  }

  const pr = await prisma.$transaction(async (tx) => {
    const created = await tx.pullRequest.create({
      data: {
        repositoryId,
        authorId: userId,
        sourceBranchId: source.id,
        targetBranchId: target.id,
        title: payload.title.trim(),
        description: payload.description.trim() || null,
        status: PullRequestStatus.OPEN,
      },
    });

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.PULL_REQUEST_CREATED,
        message: `Created pull request '${payload.title}' (${payload.sourceBranch} -> ${payload.targetBranch})`,
      },
    });

    return created;
  });

  return getPullRequestByIdOrNumber(repositoryId, pr.id, userId);
};

export const addPullRequestReview = async (
  repositoryId: string,
  userId: string,
  idOrNumber: string | number,
  review: {
    status: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED";
    comment?: string | undefined;
  }
) => {
  const role = await getUserRepositoryRole(repositoryId, userId);
  if (!role || (role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR)) {
    throw new Error("Unauthorized: Only owners and contributors can review pull requests");
  }

  const pr = await getPullRequestByIdOrNumber(repositoryId, idOrNumber, userId);

  await prisma.$transaction(async (tx) => {
    await tx.pullRequestReview.create({
      data: {
        pullRequestId: pr.id,
        reviewerId: userId,
        status: review.status as ReviewStatus,
        comment: review.comment?.trim() || null,
      },
    });

    let newStatus: PullRequestStatus = pr.status as PullRequestStatus;
    if (review.status === "APPROVED") {
      newStatus = PullRequestStatus.APPROVED;
    } else if (review.status === "CHANGES_REQUESTED") {
      newStatus = PullRequestStatus.CHANGES_REQUESTED;
    }

    await tx.pullRequest.update({
      where: { id: pr.id },
      data: {
        status: newStatus,
      },
    });
  });

  return getPullRequestByIdOrNumber(repositoryId, pr.id, userId);
};

export const addPullRequestComment = async (
  repositoryId: string,
  userId: string,
  idOrNumber: string | number,
  content: string
) => {
  const pr = await getPullRequestByIdOrNumber(repositoryId, idOrNumber, userId);

  await prisma.pullRequestComment.create({
    data: {
      pullRequestId: pr.id,
      authorId: userId,
      content: content.trim(),
    },
  });

  return getPullRequestByIdOrNumber(repositoryId, pr.id, userId);
};

export const mergePullRequest = async (
  repositoryId: string,
  userId: string,
  idOrNumber: string | number
) => {
  const role = await getUserRepositoryRole(repositoryId, userId);
  if (!role || (role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR)) {
    throw new Error("Unauthorized: Only owners and contributors can merge pull requests");
  }

  const pr = await getPullRequestByIdOrNumber(repositoryId, idOrNumber, userId);

  if (pr.status === "MERGED") {
    throw new Error("Pull request is already merged");
  }

  // 1. Conflict Detection before merge
  if (pr.hasConflicts && pr.conflictFiles.length > 0) {
    throw new Error(
      `Cannot merge pull request: Merge conflict detected in '${pr.conflictFiles.join(", ")}'. Resolve conflicts before merging.`
    );
  }

  // 2. Safe merge: apply non-conflicting changes from sourceBranch to targetBranch
  for (const diff of pr.diffs) {
    const sourceContent = await readStorageFile(repositoryId, pr.sourceBranch, diff.path);
    if (sourceContent !== null) {
      await writeStorageFile(repositoryId, pr.targetBranch, diff.path, sourceContent);
    }
  }

  // Also copy any new directory structures
  await copyBranchStorage(repositoryId, pr.sourceBranch, pr.targetBranch);

  const targetBranch = await prisma.branch.findUnique({
    where: {
      repositoryId_name: {
        repositoryId,
        name: pr.targetBranch,
      },
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.pullRequest.update({
      where: { id: pr.id },
      data: {
        status: PullRequestStatus.MERGED,
        mergedAt: new Date(),
      },
    });

    if (targetBranch) {
      await tx.commit.create({
        data: {
          repositoryId,
          branchId: targetBranch.id,
          authorId: userId,
          message: `Merge pull request #${pr.number} from ${pr.sourceBranch} into ${pr.targetBranch}`,
        },
      });
    }

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.PULL_REQUEST_MERGED,
        message: `Merged pull request #${pr.number}: ${pr.title}`,
      },
    });
  });

  return getPullRequestByIdOrNumber(repositoryId, pr.id, userId);
};

export const closePullRequest = async (
  repositoryId: string,
  userId: string,
  idOrNumber: string | number
) => {
  const pr = await getPullRequestByIdOrNumber(repositoryId, idOrNumber, userId);
  const role = await getUserRepositoryRole(repositoryId, userId);

  if (pr.author.id !== userId && role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR) {
    throw new Error("Unauthorized: You do not have permission to close this pull request");
  }

  await prisma.$transaction(async (tx) => {
    await tx.pullRequest.update({
      where: { id: pr.id },
      data: {
        status: PullRequestStatus.CLOSED,
      },
    });

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.PULL_REQUEST_CLOSED,
        message: `Closed pull request #${pr.number}: ${pr.title}`,
      },
    });
  });

  return getPullRequestByIdOrNumber(repositoryId, pr.id, userId);
};
