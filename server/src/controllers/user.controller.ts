import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../services/user.service.js";

const updateProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
  avatarUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const handleGetProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawUsername = req.params.username;
    const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;
    const profile = await getUserProfile(username, req.userId);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get profile";
    const status = message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }
};

export const handleUpdateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const updated = await updateUserProfile(req.userId, {
      bio: parseResult.data.bio,
      avatarUrl: parseResult.data.avatarUrl || null,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return res.status(400).json({ success: false, message });
  }
};

export const handleChangePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const result = await changeUserPassword(req.userId, parseResult.data);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password";
    return res.status(400).json({ success: false, message });
  }
};
