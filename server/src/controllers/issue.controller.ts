import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getIssues,
  getIssueByIdOrNumber,
  createIssue,
  updateIssueStatus,
  addIssueComment,
} from "../services/issue.service.js";

const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]),
});

const addCommentSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
});

export const handleGetIssues = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const statusFilter = req.query.status as "ALL" | "OPEN" | "CLOSED" | undefined;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const issues = await getIssues(repoId, statusFilter, req.userId);
    return res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch issues";
    const status = message.includes("not found") ? 404 : message.includes("Unauthorized") ? 401 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleGetIssueByNumber = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and issue number are required" });
    }

    const issue = await getIssueByIdOrNumber(repoId, num, req.userId);
    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch issue";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleCreateIssue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const parseResult = createIssueSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const issue = await createIssue(
      repoId,
      req.userId,
      parseResult.data.title,
      parseResult.data.description,
      parseResult.data.labels
    );

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create issue";
    return res.status(400).json({ success: false, message });
  }
};

export const handleUpdateIssueStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and issue number are required" });
    }

    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const updated = await updateIssueStatus(repoId, req.userId, num, parseResult.data.status);
    return res.status(200).json({
      success: true,
      message: `Issue marked as ${parseResult.data.status.toLowerCase()}`,
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update issue status";
    return res.status(400).json({ success: false, message });
  }
};

export const handleAddIssueComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawNum = req.params.number;
    const num = Array.isArray(rawNum) ? rawNum[0] : rawNum;

    if (!repoId || !num) {
      return res.status(400).json({ success: false, message: "Repository ID and issue number are required" });
    }

    const parseResult = addCommentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const updated = await addIssueComment(repoId, req.userId, num, parseResult.data.content);
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
