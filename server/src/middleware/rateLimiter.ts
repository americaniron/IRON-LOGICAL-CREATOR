import rateLimit from 'express-rate-limit';
import config from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use X-Forwarded-For when behind proxy (Cloudflare)
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready';
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for expensive operations (AI generation)
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 generation requests per minute
  message: {
    error: 'GENERATION_RATE_LIMIT_EXCEEDED',
    message: 'Too many generation requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
