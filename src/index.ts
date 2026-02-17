import { Hono } from 'hono';
import type { Env } from './types';
import { errorHandler, requestLogger, corsMiddleware, rateLimiter, securityHeaders } from './middleware';
import { publicApi } from './routes/public-api';
import { adminApi } from './routes/admin-api';
import { filesApi } from './routes/files-api';
import { importApi } from './routes/import-api';
import { exportApi } from './routes/export-api';
import { ratingApi } from './routes/rating-api';
import { pages } from './routes/pages';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', requestLogger);
app.use('*', errorHandler);
app.use('*', corsMiddleware);
app.use('*', securityHeaders);

// Rate limit API routes only (not pages)
app.use('/api/*', rateLimiter);

// SSR pages
app.route('/', pages);

// Public JSON API (legacy compat)
app.route('/', publicApi);

// Admin JSON API
app.route('/', adminApi);

// Files API (R2)
app.route('/', filesApi);

// Import API
app.route('/', importApi);

// Export API
app.route('/', exportApi);

// Rating API
app.route('/', ratingApi);

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not found' }, 404);
});

export default app;
