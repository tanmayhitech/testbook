import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

export interface UpdateProfileInput {
  bio?: string | null | undefined;
  avatarUrl?: string | null | undefined;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const getUserProfile = async (usernameOrId?: string, currentUserId?: string) => {
  const identifier = usernameOrId || currentUserId;
  if (!identifier) {
    throw new Error("User identifier is required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: identifier }, { username: identifier }],
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ownedRepositories: true,
          commits: true,
          pullRequests: true,
          issues: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    headline: user.bio ? user.bio.split("\n")[0] : "Software Developer & Student",
    institution: "Testbook University",
    location: "Global",
    website: `https://testbook.dev/${user.username}`,
    githubUsername: user.username,
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Git"],
    repositoriesCount: user._count.ownedRepositories,
    starsReceived: 0,
    contributionsThisYear: user._count.commits + user._count.pullRequests + user._count.issues,
  };
};

export const updateUserProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return getUserProfile(user.id);
};

export const changeUserPassword = async (userId: string, input: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(input.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { message: "Password updated successfully" };
};
