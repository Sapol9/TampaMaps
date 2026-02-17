/**
 * Simple in-memory rate limiter using sliding window counter
 *
 * NOTE: This is a per-instance limiter. In a serverless environment with
 * multiple instances, each instance has its own counter. For production
 * at scale, consider using Upstash Redis or Vercel KV for distributed
 * rate limiting across all instances.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  limit: number; // Max requests per interval
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Only run cleanup periodically
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Check rate limit for a given token (usually IP address)
 *
 * @param config - Rate limit configuration
 * @param token - Unique identifier (IP address, user ID, etc.)
 * @throws RateLimitError if rate limit is exceeded
 */
export function checkRateLimit(config: RateLimitConfig, token: string): void {
  // Periodic cleanup
  cleanupExpiredEntries();

  const now = Date.now();
  const key = `${token}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired - start new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.interval,
    });
    return;
  }

  // Within current window
  if (entry.count >= config.limit) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    throw new RateLimitError(retryAfter);
  }

  // Increment counter
  entry.count++;
}

/**
 * Get client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIp(request: Request): string {
  // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP (original client)
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // Vercel-specific header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Cloudflare header
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  // Fallback for anonymous/local requests
  return "anonymous";
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // For expensive operations like image generation
  expensive: { interval: 60 * 1000, limit: 10 }, // 10 per minute

  // For checkout/payment endpoints
  checkout: { interval: 60 * 1000, limit: 5 }, // 5 per minute

  // For webhooks (can be bursty)
  webhook: { interval: 60 * 1000, limit: 30 }, // 30 per minute

  // For general API endpoints
  standard: { interval: 60 * 1000, limit: 60 }, // 60 per minute
};