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
  internal: (message = 'Internal server error') => new AppError(500, message, 'INTERNAL_ERROR'),
};

// Error handler middleware
export const errorHandler = async (c: Context<{ Bindings: Env }>, next: Next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      const response: ApiResponse = {
        success: false,
        error: err.message,
      };
      return c.json(response, err.statusCode as 400 | 401 | 403 | 404 | 500);
    }

    // Unknown error
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Log for debugging (Cloudflare Workers console)
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', message);
    
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    return c.json(response, 500);
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

// Helper to wrap async handlers
export const asyncHandler = <T>(
  fn: (c: Context<{ Bindings: Env }>) => Promise<T>
) => {
  return async (c: Context<{ Bindings: Env }>) => {
    return await fn(c);
  };
};

// Success response helper
export const ok = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});
