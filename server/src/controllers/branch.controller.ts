import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getBranches,
  createBranch,
  deleteBranch,
} from "../services/branch.service.js";

const createBranchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  sourceBranch: z.string().optional(),
});

export const handleGetBranches = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const branches = await getBranches(repoId, req.userId);
    return res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    const status = message.includes("not found") ? 404 : message.includes("Unauthorized") ? 401 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleCreateBranch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const parseResult = createBranchSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const branch = await createBranch(
      repoId,
      req.userId,
      parseResult.data.name,
      parseResult.data.sourceBranch || "main"
    );

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create branch";
    return res.status(400).json({ success: false, message });
  }
};

export const handleDeleteBranch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawBranch = req.params.branchName;
    const branchName = Array.isArray(rawBranch) ? rawBranch[0] : rawBranch;

    if (!repoId || !branchName) {
      return res.status(400).json({ success: false, message: "Repository ID and branch name are required" });
    }

    const result = await deleteBranch(repoId, req.userId, branchName);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete branch";
    return res.status(400).json({ success: false, message });
  }
};
