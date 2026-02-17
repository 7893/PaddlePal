import type { Context, Next } from 'hono';
import type { Env, ApiResponse } from './types';

// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Common errors
export const Errors = {
  notFound: (resource = 'Resource') => new AppError(404, `${resource} not found`, 'NOT_FOUND'),
  badRequest: (message: string) => new AppError(400, message, 'BAD_REQUEST'),
  unauthorized: () => new AppError(401, 'Unauthorized', 'UNAUTHORIZED'),
  forbidden: () => new AppError(403, 'Forbidden', 'FORBIDDEN'),
  tooManyRequests: () => new AppError(429, 'Too many requests', 'RATE_LIMITED'),
  internal: (message = 'Internal server error') => new AppError(500, message, 'INTERNAL_ERROR'),
};

// Error handler middleware
export const errorHandler = async (c: Context<{ Bindings: Env }>, next: Next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      const response: ApiResponse = { success: false, error: err.message };
      return c.json(response, err.statusCode as 400 | 401 | 403 | 404 | 429 | 500);
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', message);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Request logger middleware
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  // eslint-disable-next-line no-console
  console.log(`${c.req.method} ${c.req.path} - ${c.res.status} (${ms}ms)`);
};

// CORS middleware
const ALLOWED_ORIGINS = [
  'https://paddlepal.53.workers.dev',
  'http://localhost:8787', // dev
];

export const corsMiddleware = async (c: Context, next: Next) => {
  const origin = c.req.header('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.workers.dev');
  
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  await next();
  
  c.res.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGINS[0]);
};

// Rate limiting (simple in-memory, resets on worker restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

export const rateLimiter = async (c: Context, next: Next) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimitMap.set(ip, record);
  }
  
  record.count++;
  
  c.res.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));
  c.res.headers.set('X-RateLimit-Remaining', String(Math.max(0, RATE_LIMIT - record.count)));
  
  if (record.count > RATE_LIMIT) {
    throw Errors.tooManyRequests();
  }
  
  await next();
};

// Security headers middleware (CSP)
export const securityHeaders = async (c: Context, next: Next) => {
  await next();
  
  // Content Security Policy
  c.res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.sheetjs.com https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '));
  
  // Other security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
};

// Input validation helpers
export const validate = {
  id: (val: string | undefined): number => {
    const num = parseInt(val || '', 10);
    if (isNaN(num) || num < 1) throw Errors.badRequest('Invalid ID');
    return num;
  },
  
  string: (val: unknown, field: string, maxLen = 255): string => {
    if (typeof val !== 'string' || !val.trim()) {
      throw Errors.badRequest(`${field} is required`);
    }
    if (val.length > maxLen) {
      throw Errors.badRequest(`${field} too long (max ${maxLen})`);
    }
    return val.trim();
  },
  
  optional: (val: unknown, maxLen = 255): string | null => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val !== 'string') throw Errors.badRequest('Invalid value');
    if (val.length > maxLen) throw Errors.badRequest('Value too long');
    return val.trim();
  },
  
  email: (val: unknown): string => {
    const str = validate.string(val, 'Email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      throw Errors.badRequest('Invalid email format');
    }
    return str;
  },
  
  enum: <T extends string>(val: unknown, allowed: T[], field: string): T => {
    if (!allowed.includes(val as T)) {
      throw Errors.badRequest(`${field} must be one of: ${allowed.join(', ')}`);
    }
    return val as T;
  },
};

// Success response helper
export const ok = <T>(data: T): ApiResponse<T> => ({ success: true, data });
