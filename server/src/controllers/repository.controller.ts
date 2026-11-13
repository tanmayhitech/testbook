import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  createRepository,
  listAccessibleRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository,
  listRepositoryMembers,
  addRepositoryMember,
  removeRepositoryMember,
  getRepositoryLanguages,
} from "../services/repository.service.js";
import { MemberRole, RepositoryVisibility } from "../generated/prisma/enums.js";

const createRepoSchema = z.object({
  name: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name must be 100 characters or less")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Repository name can only contain alphanumeric characters, hyphens, periods, and underscores"
    ),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  visibility: z.nativeEnum(RepositoryVisibility).optional(),
});

const updateRepoSchema = z.object({
  name: z
    .string()
    .min(1, "Repository name cannot be empty")
    .max(100, "Repository name must be 100 characters or less")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Repository name can only contain alphanumeric characters, hyphens, periods, and underscores"
    )
    .optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  visibility: z.nativeEnum(RepositoryVisibility).optional(),
});

const addMemberSchema = z.object({
  username: z.string().min(1, "Username is required"),
  role: z.enum([MemberRole.CONTRIBUTOR, MemberRole.VIEWER], {
    error: "Role must be either CONTRIBUTOR or VIEWER",
  }),
});

export const handleCreateRepository = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const validation = createRepoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const repo = await createRepository({
      ...validation.data,
      ownerId: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Repository created successfully",
      data: repo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create repository";
    const status = message.includes("already exists") ? 409 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleListRepositories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const repositories = await listAccessibleRepositories(req.userId);

    return res.status(200).json({
      success: true,
      message: "Repositories retrieved successfully",
      data: repositories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch repositories";
    return res.status(500).json({ success: false, message });
  }
};

export const handleGetRepository = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = req.params.id;
    if (!repoId || typeof repoId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const userId = req.userId || "";
    const repo = await getRepositoryById(repoId, userId);

    return res.status(200).json({
      success: true,
      message: "Repository retrieved successfully",
      data: repo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch repository";
    const status = message.includes("not found") ? 404 : message.includes("Access denied") ? 403 : 500;
    return res.status(status).json({ success: false, message });
  }
};

export const handleUpdateRepository = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const repoId = req.params.id;
    if (!repoId || typeof repoId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const validation = updateRepoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const updated = await updateRepository(repoId, req.userId, validation.data);

    return res.status(200).json({
      success: true,
      message: "Repository updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update repository";
    const status = message.includes("Unauthorized")
      ? 403
      : message.includes("not found")
      ? 404
      : message.includes("already exists")
      ? 409
      : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleDeleteRepository = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const repoId = req.params.id;
    if (!repoId || typeof repoId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const result = await deleteRepository(repoId, req.userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete repository";
    const status = message.includes("Unauthorized") ? 403 : message.includes("not found") ? 404 : 500;
    return res.status(status).json({ success: false, message });
  }
};

export const handleListMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = req.params.id;
    if (!repoId || typeof repoId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const userId = req.userId || "";
    const members = await listRepositoryMembers(repoId, userId);

    return res.status(200).json({
      success: true,
      message: "Members retrieved successfully",
      data: members,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list members";
    const status = message.includes("not found") ? 404 : message.includes("Access denied") ? 403 : 500;
    return res.status(status).json({ success: false, message });
  }
};

export const handleAddMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const repoId = req.params.id;
    if (!repoId || typeof repoId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const validation = addMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const member = await addRepositoryMember(repoId, req.userId, {
      username: validation.data.username,
      role: validation.data.role as MemberRole,
    });

    return res.status(200).json({
      success: true,
      message: "Member added/updated successfully",
      data: member,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add member";
    const status = message.includes("Unauthorized")
      ? 403
      : message.includes("not found")
      ? 404
      : message.includes("already")
      ? 400
      : 500;
    return res.status(status).json({ success: false, message });
  }
};

export const handleRemoveMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const repoId = req.params.id;
    const targetUserId = req.params.userId;
    if (!repoId || typeof repoId !== "string" || !targetUserId || typeof targetUserId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID and User ID are required" });
    }

    const result = await removeRepositoryMember(repoId, req.userId, targetUserId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove member";
    const status = message.includes("Unauthorized") ? 403 : message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleGetRepositoryLanguages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const repoId = req.params.id;
    if (!repoId || typeof repoId !== "string") {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const languages = await getRepositoryLanguages(repoId, req.userId);
    return res.status(200).json({
      success: true,
      data: languages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch repository languages";
    const status = message.includes("Unauthorized") || message.includes("Access denied")
      ? 403
      : message.includes("not found")
      ? 404
      : 500;
    return res.status(status).json({ success: false, message });
  }
};
