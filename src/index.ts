import { Hono } from 'hono';
import type { Env } from './types';
import { errorHandler, requestLogger, corsMiddleware, rateLimiter, securityHeaders } from './middleware';
import { publicApi } from './routes/public-api';
import { adminApi } from './routes/admin-api';
import { filesApi } from './routes/files-api';
import { importApi } from './routes/import-api';
import { exportApi } from './routes/export-api';
import { ratingApi } from './routes/rating-api';
import { drawApi } from './routes/draw-api';
import { scheduleApi } from './routes/schedule-api';
import { controlApi } from './routes/control-api';
import { confirmApi } from './routes/confirm-api';
import { usersApi } from './routes/users-api';
import { notifyApi } from './routes/notify-api';
import { checkinApi } from './routes/checkin-api';
import { appealsApi } from './routes/appeals-api';
import { settingsApi } from './routes/settings-api';
import { knockoutApi } from './routes/knockout-api';
import { utilApi } from './routes/util-api';
import { batchApi } from './routes/batch-api';
import { pages } from './routes/pages';
import { auth, requireAuth } from './routes/auth';

export { LiveDO } from './do/live';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', requestLogger);
app.use('*', errorHandler);
app.use('*', corsMiddleware);
app.use('*', securityHeaders);

// Rate limit API routes only (not pages)
app.use('/api/*', rateLimiter);

// Auth routes (login/logout)
app.route('/', auth);

// Protect admin routes
app.use('/admin/*', requireAuth);
app.use('/api/admin/*', requireAuth);

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

// Draw API
app.route('/', drawApi);

// Schedule API
app.route('/', scheduleApi);

// Control API
app.route('/', controlApi);

// Confirm API
app.route('/', confirmApi);

// Users API
app.route('/', usersApi);

// Notify API
app.route('/', notifyApi);

// Checkin API
app.route('/', checkinApi);

// Appeals API
app.route('/', appealsApi);

// Settings API
app.route('/', settingsApi);

// Knockout API
app.route('/', knockoutApi);

// Util API
app.route('/', utilApi);

// Batch API
app.route('/', batchApi);

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not found' }, 404);
});

export default {
  fetch(req: Request, env: Env, ctx: ExecutionContext) {
    // Bypass Hono for WebSocket upgrade requests
    const url = new URL(req.url);
    if (url.pathname === '/ws/live' && req.headers.get('Upgrade') === 'websocket') {
      const id = env.PADDLEPAL_DO.idFromName('global');
      return env.PADDLEPAL_DO.get(id).fetch(req);
    }
    return app.fetch(req, env, ctx);
  },
} satisfies ExportedHandler<Env>;
