import { Router } from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", authenticate, getMe);

export default router;
