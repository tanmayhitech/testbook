import { prisma } from "../config/prisma.js";
import { ActivityType, IssueStatus, MemberRole, RepositoryVisibility } from "../generated/prisma/enums.js";
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

export const getIssues = async (
  repositoryId: string,
  statusFilter?: "ALL" | "OPEN" | "CLOSED",
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

  const issues = await prisma.issue.findMany({
    where: {
      repositoryId,
      ...(statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter === "OPEN" ? IssueStatus.OPEN : IssueStatus.CLOSED }
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
    orderBy: { createdAt: "asc" },
  });

  return issues.map((issue, index) => {
    return {
      id: issue.id,
      number: index + 1,
      repositoryId: issue.repositoryId,
      title: issue.title,
      description: issue.description ?? "",
      status: issue.status,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      closedAt: issue.closedAt?.toISOString() ?? null,
      author: sanitizeUser(issue.author),
      assignee: null,
      labels: ["issue"],
      commentsCount: issue.comments.length,
      comments: issue.comments.map((c) => ({
        id: c.id,
        issueId: c.issueId,
        author: sanitizeUser(c.author),
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    };
  });
};

export const getIssueByIdOrNumber = async (
  repositoryId: string,
  idOrNumber: string | number,
  userId?: string
) => {
  const allIssues = await getIssues(repositoryId, "ALL", userId);
  const numeric = typeof idOrNumber === "number" ? idOrNumber : parseInt(idOrNumber, 10);

  if (!isNaN(numeric)) {
    const found = allIssues.find((i) => i.number === numeric);
    if (found) return found;
  }

  const foundById = allIssues.find((i) => i.id === String(idOrNumber));
  if (foundById) return foundById;

  throw new Error("Issue not found");
};

export const createIssue = async (
  repositoryId: string,
  userId: string,
  title: string,
  description?: string,
  _labels?: string[]
) => {
  const role = await getUserRepositoryRole(repositoryId, userId);
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { visibility: true },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  // Any authenticated user can create issue on public repo, or member on private repo
  if (repo.visibility === RepositoryVisibility.PRIVATE && !role) {
    throw new Error("Unauthorized: Access denied to private repository");
  }

  const issue = await prisma.$transaction(async (tx) => {
    const created = await tx.issue.create({
      data: {
        repositoryId,
        authorId: userId,
        title: title.trim(),
        description: description?.trim() || null,
        status: IssueStatus.OPEN,
      },
    });

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.ISSUE_CREATED,
        message: `Opened issue #${title}`,
      },
    });

    return created;
  });

  return getIssueByIdOrNumber(repositoryId, issue.id, userId);
};

export const updateIssueStatus = async (
  repositoryId: string,
  userId: string,
  idOrNumber: string | number,
  status: "OPEN" | "CLOSED"
) => {
  const targetIssue = await getIssueByIdOrNumber(repositoryId, idOrNumber, userId);
  const role = await getUserRepositoryRole(repositoryId, userId);

  // Author, contributor or owner can close/reopen
  if (targetIssue.author.id !== userId && role !== MemberRole.OWNER && role !== MemberRole.CONTRIBUTOR) {
    throw new Error("Unauthorized: You do not have permission to change this issue's status");
  }

  const newStatus = status === "OPEN" ? IssueStatus.OPEN : IssueStatus.CLOSED;
  const closedAt = newStatus === IssueStatus.CLOSED ? new Date() : null;

  await prisma.$transaction(async (tx) => {
    await tx.issue.update({
      where: { id: targetIssue.id },
      data: {
        status: newStatus,
        closedAt,
      },
    });

    if (newStatus === IssueStatus.CLOSED) {
      await tx.activity.create({
        data: {
          repositoryId,
          userId,
          type: ActivityType.ISSUE_CLOSED,
          message: `Closed issue #${targetIssue.number}: ${targetIssue.title}`,
        },
      });
    }
  });

  return getIssueByIdOrNumber(repositoryId, targetIssue.id, userId);
};

export const addIssueComment = async (
  repositoryId: string,
  userId: string,
  idOrNumber: string | number,
  content: string
) => {
  const targetIssue = await getIssueByIdOrNumber(repositoryId, idOrNumber, userId);

  await prisma.issueComment.create({
    data: {
      issueId: targetIssue.id,
      authorId: userId,
      content: content.trim(),
    },
  });

  return getIssueByIdOrNumber(repositoryId, targetIssue.id, userId);
};
