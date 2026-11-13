import type { NextFunction, Request, Response } from "express";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * Lightweight, in-memory rate limiter middleware for sensitive endpoints.
 * Prunes expired entries periodically to prevent memory leaks.
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests. Please try again later.",
  } = options;

  const hits = new Map<string, ClientRecord>();

  // Cleanup expired entries every 2 minutes
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    }
  }, 120000);

  // Unref timer so it doesn't block process shutdown
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // In test environment or if disabled, skip
    if (process.env.NODE_ENV === "test" && process.env.ENABLE_RATE_LIMIT !== "true") {
      return next();
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    const record = hits.get(clientIp);

    if (!record || now > record.resetTime) {
      hits.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    return next();
  };
};

/**
 * Strict limiter for sensitive authentication endpoints (e.g. login, register, password change)
 * 20 requests per 1 minute window
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: "Too many authentication attempts. Please wait 60 seconds before trying again.",
});
