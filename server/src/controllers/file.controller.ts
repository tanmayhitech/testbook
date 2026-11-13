import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getFiles,
  getFileContent,
  saveFile,
  deleteFile,
} from "../services/file.service.js";

const saveFileSchema = z.object({
  branch: z.string().default("main"),
  path: z.string().min(1, "Path is required"),
  content: z.string(),
  commitMessage: z.string().default("Update file"),
});

const deleteFileSchema = z.object({
  branch: z.string().default("main"),
  path: z.string().min(1, "Path is required"),
  commitMessage: z.string().default("Delete file"),
});

export const handleGetFiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const branch = typeof req.query.branch === "string" ? req.query.branch : "main";

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const files = await getFiles(repoId, branch, req.userId);
    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch files";
    const status = message.includes("not found") ? 404 : message.includes("Unauthorized") ? 401 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleGetFileContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const branch = typeof req.query.branch === "string" ? req.query.branch : "main";
    const filePath = typeof req.query.path === "string" ? req.query.path : "";

    if (!repoId || !filePath) {
      return res.status(400).json({ success: false, message: "Repository ID and file path are required" });
    }

    const file = await getFileContent(repoId, branch, filePath, req.userId);
    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch file content";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleSaveFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const parseResult = saveFileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const result = await saveFile(
      repoId,
      req.userId,
      parseResult.data.branch,
      parseResult.data.path,
      parseResult.data.content,
      parseResult.data.commitMessage
    );

    return res.status(200).json({
      success: true,
      message: "File saved and committed successfully",
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save file";
    return res.status(400).json({ success: false, message });
  }
};

export const handleDeleteFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const parseResult = deleteFileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const result = await deleteFile(
      repoId,
      req.userId,
      parseResult.data.branch,
      parseResult.data.path,
      parseResult.data.commitMessage
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete file";
    return res.status(400).json({ success: false, message });
  }
};
