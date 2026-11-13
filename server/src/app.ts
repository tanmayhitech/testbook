import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import userRoutes from "./routes/user.routes.js";
import { handleGetActivities } from "./controllers/activity.controller.js";
import { optionalAuthenticate } from "./middleware/auth.middleware.js";

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or restricted if configured
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/repos", repositoryRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/users", userRoutes);
app.get("/api/activities", optionalAuthenticate, handleGetActivities);

// Health Checks
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Testbook API is running",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection is working",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default app;
