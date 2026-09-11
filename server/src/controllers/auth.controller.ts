import type { Request, Response } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),

  email: z
    .string()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const { username, email, password } = result.data;

    const resultData = await registerUser({
      username,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: resultData,
    });
  } catch (error) {
    console.error("Registration error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const { email, password } = result.data;

    const resultData = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: resultData,
    });
  } catch (error) {
    console.error("Login error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(401).json({
      success: false,
      message,
    });
  }
  
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};