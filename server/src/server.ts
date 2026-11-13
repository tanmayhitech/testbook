import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Testbook API running on http://localhost:${PORT}`);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down Testbook API...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error disconnecting from database:", err);
    }
    process.exit(0);
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
