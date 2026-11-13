import { prisma } from "../config/prisma.js";
import { RepositoryVisibility } from "../generated/prisma/enums.js";
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

export type ActivityDisplayType =
  | "REPOSITORY_CREATED"
  | "MEMBER_ADDED"
  | "BRANCH_CREATED"
  | "COMMIT_CREATED"
  | "ISSUE_CREATED"
  | "ISSUE_CLOSED"
  | "PULL_REQUEST_CREATED"
  | "PULL_REQUEST_MERGED"
  | "PULL_REQUEST_CLOSED"
  | "REVIEW_SUBMITTED";

export const getActivities = async (repositoryId?: string, userId?: string) => {
  if (repositoryId) {
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
        throw new Error("Access denied: You do not have permission to view activities for this repository");
      }
    }
  }

  const activities = await prisma.activity.findMany({
    where: {
      ...(repositoryId ? { repositoryId } : {}),
      repository: {
        OR: [
          { visibility: RepositoryVisibility.PUBLIC },
          ...(userId
            ? [
                { ownerId: userId },
                { members: { some: { userId } } },
              ]
            : []),
        ],
      },
    },
    include: {
      repository: {
        select: {
          name: true,
        },
      },
      user: {
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
    take: 50,
  });

  return activities.map((act) => ({
    id: act.id,
    repositoryId: act.repositoryId,
    repositoryName: act.repository.name,
    user: sanitizeUser(act.user),
    type: act.type as ActivityDisplayType,
    message: act.message ?? `Action performed on repository`,
    createdAt: act.createdAt.toISOString(),
  }));
};
