import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getCommits,
  getCommitBySha,
} from "../services/commit.service.js";

export const handleGetCommits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const branch = typeof req.query.branch === "string" ? req.query.branch : undefined;

    if (!repoId) {
      return res.status(400).json({ success: false, message: "Repository ID is required" });
    }

    const commits = await getCommits(repoId, branch, req.userId);
    return res.status(200).json({
      success: true,
      data: commits,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch commits";
    const status = message.includes("not found") ? 404 : message.includes("Unauthorized") ? 401 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleGetCommitBySha = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id;
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;
    const rawSha = req.params.sha;
    const sha = Array.isArray(rawSha) ? rawSha[0] : rawSha;

    if (!repoId || !sha) {
      return res.status(400).json({ success: false, message: "Repository ID and commit SHA are required" });
    }

    const commit = await getCommitBySha(repoId, sha, req.userId);
    return res.status(200).json({
      success: true,
      data: commit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch commit";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }
};
