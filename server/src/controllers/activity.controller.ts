import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getActivities } from "../services/activity.service.js";

export const handleGetActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawRepoId = req.params.id || (typeof req.query.repoId === "string" ? req.query.repoId : undefined);
    const repoId = Array.isArray(rawRepoId) ? rawRepoId[0] : rawRepoId;

    const activities = await getActivities(repoId, req.userId);
    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch activities";
    return res.status(400).json({ success: false, message });
  }
};
