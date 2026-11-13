import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getPullRequests,
  getPullRequestByIdOrNumber,
  createPullRequest,
  addPullRequestReview,
  addPullRequestComment,
  mergePullRequest,
  closePullRequest,
} from "../services/pull-request.service.js";

const createPullSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().default(""),
  sourceBranch: z.string().min(1, "Source branch is required"),
  targetBranch: z.string().min(1, "Target branch is required"),
});

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "CHANGES_REQUESTED", "COMMENTED"]),
  comment: z.string().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
});

export const handleGetPulls = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const statusFilter = req.query.status as "ALL" | "OPEN" | "MERGED" | "CLOSED" | undefined;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const pulls = await getPullRequests(repoId, statusFilter, req.userId);
    return res.status(200).json({
      success: true,
      data: pulls,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch pull requests";
    const status = message.includes("not found") ? 404 : message.includes("Unauthorized") ? 401 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleGetPullByNumber = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and PR number are required" });
    }

    const pr = await getPullRequestByIdOrNumber(repoId, num, req.userId);
    return res.status(200).json({
      success: true,
      data: pr,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch pull request";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleCreatePull = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const parseResult = createPullSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const pr = await createPullRequest(repoId, req.userId, parseResult.data);
    return res.status(201).json({
      success: true,
      message: "Pull request created successfully",
      data: pr,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create pull request";
    return res.status(400).json({ success: false, message });
  }
};

export const handleAddPullReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and PR number are required" });
    }

    const parseResult = reviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const updated = await addPullRequestReview(repoId, req.userId, num, parseResult.data);
    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add review";
    return res.status(400).json({ success: false, message });
  }
};

export const handleAddPullComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and PR number are required" });
    }

    const parseResult = commentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const updated = await addPullRequestComment(repoId, req.userId, num, parseResult.data.content);
    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add comment";
    return res.status(400).json({ success: false, message });
  }
};

export const handleMergePull = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and PR number are required" });
    }

    const merged = await mergePullRequest(repoId, req.userId, num);
    return res.status(200).json({
      success: true,
      message: "Pull request merged successfully",
      data: merged,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to merge pull request";
    return res.status(400).json({ success: false, message });
  }
};

export const handleClosePull = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and PR number are required" });
    }

    const closed = await closePullRequest(repoId, req.userId, num);
    return res.status(200).json({
      success: true,
      message: "Pull request closed",
      data: closed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to close pull request";
    return res.status(400).json({ success: false, message });
  }
};
