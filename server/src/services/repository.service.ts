import path from "path";
import { prisma } from "../config/prisma.js";
import { MemberRole, RepositoryVisibility, ActivityType } from "../generated/prisma/enums.js";

export interface CreateRepositoryInput {
  name: string;
  description?: string | undefined;
  visibility?: RepositoryVisibility | undefined;
  ownerId: string;
}

export interface UpdateRepositoryInput {
  name?: string | undefined;
  description?: string | undefined;
  visibility?: RepositoryVisibility | undefined;
}

export interface AddMemberInput {
  username: string;
  role: MemberRole;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
}

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
}): UserSummary => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
});

/**
 * Check a user's role in a given repository
 */
export const getUserRepositoryRole = async (
  repositoryId: string,
  userId: string
): Promise<MemberRole | null> => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { ownerId: true },
  });

  if (!repo) return null;
  if (repo.ownerId === userId) return MemberRole.OWNER;

  const membership = await prisma.repositoryMember.findUnique({
    where: {
      repositoryId_userId: {
        repositoryId,
        userId,
      },
    },
    select: { role: true },
  });

  return membership?.role ?? null;
};

/**
 * Create a new repository with default branch and owner membership
 */
export const createRepository = async (input: CreateRepositoryInput) => {
  const { name, description, visibility = RepositoryVisibility.PRIVATE, ownerId } = input;

  const existingRepo = await prisma.repository.findUnique({
    where: {
      ownerId_name: {
        ownerId,
        name,
      },
    },
  });

  if (existingRepo) {
    throw new Error(`Repository with name '${name}' already exists for this account`);
  }

  // Create repository, default branch, owner member entry, and activity inside transaction
  const repository = await prisma.$transaction(async (tx) => {
    const repo = await tx.repository.create({
      data: {
        name,
        description: description?.trim() || null,
        visibility,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    // Create default 'main' branch
    await tx.branch.create({
      data: {
        repositoryId: repo.id,
        name: "main",
      },
    });

    // Create owner membership entry
    await tx.repositoryMember.create({
      data: {
        repositoryId: repo.id,
        userId: ownerId,
        role: MemberRole.OWNER,
      },
    });

    // Record activity
    await tx.activity.create({
      data: {
        repositoryId: repo.id,
        userId: ownerId,
        type: ActivityType.REPOSITORY_CREATED,
        message: `Created repository ${name}`,
      },
    });

    return repo;
  });

  return {
    ...repository,
    owner: sanitizeUser(repository.owner),
    currentUserRole: MemberRole.OWNER,
  };
};

/**
 * List all repositories accessible to the user (owned, member, or public)
 */
export const listAccessibleRepositories = async (userId: string) => {
  const repositories = await prisma.repository.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
        { visibility: RepositoryVisibility.PUBLIC },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
      _count: {
        select: {
          members: true,
          branches: true,
          commits: true,
          issues: true,
          pullRequests: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return repositories.map((repo) => {
    let role: MemberRole | null = null;
    if (repo.ownerId === userId) {
      role = MemberRole.OWNER;
    } else if (repo.members.length > 0 && repo.members[0]) {
      role = repo.members[0].role;
    }

    return {
      id: repo.id,
      name: repo.name,
      description: repo.description,
      visibility: repo.visibility,
      ownerId: repo.ownerId,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      owner: sanitizeUser(repo.owner),
      currentUserRole: role,
      counts: repo._count,
    };
  });
};

/**
 * Get repository details by ID with access control
 */
export const getRepositoryById = async (repositoryId: string, userId: string) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
      branches: {
        select: { id: true, name: true, createdAt: true },
      },
      _count: {
        select: {
          members: true,
          branches: true,
          commits: true,
          issues: true,
          pullRequests: true,
          files: true,
        },
      },
    },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  const isOwner = repo.ownerId === userId;
  const isMember = repo.members.length > 0;
  const isPublic = repo.visibility === RepositoryVisibility.PUBLIC;

  if (!isPublic && !isOwner && !isMember) {
    throw new Error("Access denied: You do not have permission to view this repository");
  }

  const role: MemberRole | null = isOwner
    ? MemberRole.OWNER
    : isMember && repo.members[0]
    ? repo.members[0].role
    : isPublic
    ? MemberRole.VIEWER
    : null;

  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    visibility: repo.visibility,
    ownerId: repo.ownerId,
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
    owner: sanitizeUser(repo.owner),
    branches: repo.branches,
    currentUserRole: role,
    counts: repo._count,
  };
};

/**
 * Update repository metadata (OWNER only)
 */
export const updateRepository = async (
  repositoryId: string,
  userId: string,
  input: UpdateRepositoryInput
) => {
  const userRole = await getUserRepositoryRole(repositoryId, userId);

  if (userRole !== MemberRole.OWNER) {
    throw new Error("Unauthorized: Only the repository OWNER can update repository settings");
  }

  const existingRepo = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!existingRepo) {
    throw new Error("Repository not found");
  }

  if (input.name && input.name !== existingRepo.name) {
    const duplicate = await prisma.repository.findUnique({
      where: {
        ownerId_name: {
          ownerId: existingRepo.ownerId,
          name: input.name,
        },
      },
    });

    if (duplicate) {
      throw new Error(`Repository with name '${input.name}' already exists for this owner`);
    }
  }

  const updated = await prisma.repository.update({
    where: { id: repositoryId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
      ...(input.visibility ? { visibility: input.visibility } : {}),
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    visibility: updated.visibility,
    ownerId: updated.ownerId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    owner: sanitizeUser(updated.owner),
    currentUserRole: MemberRole.OWNER,
  };
};

/**
 * Delete a repository (OWNER only)
 */
export const deleteRepository = async (repositoryId: string, userId: string) => {
  const userRole = await getUserRepositoryRole(repositoryId, userId);

  if (userRole !== MemberRole.OWNER) {
    throw new Error("Unauthorized: Only the repository OWNER can delete this repository");
  }

  const existing = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!existing) {
    throw new Error("Repository not found");
  }

  await prisma.repository.delete({
    where: { id: repositoryId },
  });

  return { message: "Repository deleted successfully" };
};

/**
 * List all members of a repository
 */
export const listRepositoryMembers = async (repositoryId: string, userId: string) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  const userRole = await getUserRepositoryRole(repositoryId, userId);
  if (repo.visibility === RepositoryVisibility.PRIVATE && !userRole) {
    throw new Error("Access denied: You do not have permission to view members of this repository");
  }

  const members = await prisma.repositoryMember.findMany({
    where: { repositoryId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return members.map((m) => ({
    id: m.id,
    role: m.role,
    createdAt: m.createdAt,
    user: sanitizeUser(m.user),
  }));
};

/**
 * Add or update a collaborator role in the repository (OWNER only)
 */
export const addRepositoryMember = async (
  repositoryId: string,
  userId: string,
  input: AddMemberInput
) => {
  const currentRole = await getUserRepositoryRole(repositoryId, userId);

  if (currentRole !== MemberRole.OWNER) {
    throw new Error("Unauthorized: Only the repository OWNER can add or manage members");
  }

  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  // Find target user by username
  const targetUser = await prisma.user.findUnique({
    where: { username: input.username },
  });

  if (!targetUser) {
    throw new Error(`User with username '${input.username}' not found`);
  }

  if (targetUser.id === repo.ownerId) {
    throw new Error("The repository owner already has OWNER role");
  }

  const member = await prisma.$transaction(async (tx) => {
    const m = await tx.repositoryMember.upsert({
      where: {
        repositoryId_userId: {
          repositoryId,
          userId: targetUser.id,
        },
      },
      update: {
        role: input.role,
      },
      create: {
        repositoryId,
        userId: targetUser.id,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    await tx.activity.create({
      data: {
        repositoryId,
        userId,
        type: ActivityType.MEMBER_ADDED,
        message: `Added member @${targetUser.username} with role ${input.role}`,
      },
    });

    return m;
  });

  return {
    id: member.id,
    role: member.role,
    createdAt: member.createdAt,
    user: sanitizeUser(member.user),
  };
};

/**
 * Remove a member from the repository (OWNER or self-removal)
 */
export const removeRepositoryMember = async (
  repositoryId: string,
  currentUserId: string,
  targetUserId: string
) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repo) {
    throw new Error("Repository not found");
  }

  if (targetUserId === repo.ownerId) {
    throw new Error("Cannot remove the repository owner");
  }

  const currentRole = await getUserRepositoryRole(repositoryId, currentUserId);
  const isSelf = currentUserId === targetUserId;

  if (currentRole !== MemberRole.OWNER && !isSelf) {
    throw new Error("Unauthorized: Only the repository OWNER can remove collaborators");
  }

  const member = await prisma.repositoryMember.findUnique({
    where: {
      repositoryId_userId: {
        repositoryId,
        userId: targetUserId,
      },
    },
  });

  if (!member) {
    throw new Error("User is not a member of this repository");
  }

  await prisma.repositoryMember.delete({
    where: {
      repositoryId_userId: {
        repositoryId,
        userId: targetUserId,
      },
    },
  });

  return { message: "Member removed successfully" };
};

const LANGUAGE_MAP: Record<string, { name: string; color: string }> = {
  ".ts": { name: "TypeScript", color: "#3178c6" },
  ".tsx": { name: "TypeScript", color: "#3178c6" },
  ".js": { name: "JavaScript", color: "#f7df1e" },
  ".jsx": { name: "JavaScript", color: "#f7df1e" },
  ".py": { name: "Python", color: "#3572A5" },
  ".java": { name: "Java", color: "#b07219" },
  ".c": { name: "C", color: "#555555" },
  ".cpp": { name: "C++", color: "#f34b7d" },
  ".cc": { name: "C++", color: "#f34b7d" },
  ".cs": { name: "C#", color: "#178600" },
  ".go": { name: "Go", color: "#00ADD8" },
  ".rs": { name: "Rust", color: "#dea584" },
  ".html": { name: "HTML", color: "#e34c26" },
  ".css": { name: "CSS", color: "#563d7c" },
  ".scss": { name: "SCSS", color: "#c6538c" },
  ".json": { name: "JSON", color: "#292929" },
  ".md": { name: "Markdown", color: "#083fa1" },
  ".sql": { name: "SQL", color: "#e38c00" },
  ".sh": { name: "Shell", color: "#89e051" },
  ".yml": { name: "YAML", color: "#cb171e" },
  ".yaml": { name: "YAML", color: "#cb171e" },
};

export interface LanguageStat {
  name: string;
  color: string;
  bytes: number;
  percentage: number;
}

export const getRepositoryLanguages = async (
  repositoryId: string,
  userId?: string
): Promise<LanguageStat[]> => {
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
      throw new Error("Access denied: You do not have permission to view this repository");
    }
  }

  const files = await prisma.file.findMany({
    where: { repositoryId },
    select: { path: true, size: true },
  });

  if (files.length === 0) {
    return [];
  }

  const langTotals: Record<string, { color: string; bytes: number }> = {};
  let totalBytes = 0;

  for (const f of files) {
    const ext = path.extname(f.path).toLowerCase();
    const lang = LANGUAGE_MAP[ext] || { name: "Other", color: "#8b949e" };
    const fileSize = Math.max(f.size || 0, 100); // minimum 100 bytes weighting

    if (!langTotals[lang.name]) {
      langTotals[lang.name] = { color: lang.color, bytes: 0 };
    }
    langTotals[lang.name]!.bytes += fileSize;
    totalBytes += fileSize;
  }

  const stats: LanguageStat[] = Object.entries(langTotals).map(([name, data]) => {
    const percentage = totalBytes > 0 ? Number(((data.bytes / totalBytes) * 100).toFixed(1)) : 0;
    return {
      name,
      color: data.color,
      bytes: data.bytes,
      percentage,
    };
  });

  return stats.sort((a, b) => b.bytes - a.bytes);
};
