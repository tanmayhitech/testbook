import { Router } from "express";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
} from "../controllers/user.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.get("/profile", authenticate, handleGetProfile);
router.patch("/profile", authenticate, handleUpdateProfile);
router.post("/password", authenticate, authRateLimiter, handleChangePassword);
router.get("/:username", optionalAuthenticate, handleGetProfile);

export default router;
