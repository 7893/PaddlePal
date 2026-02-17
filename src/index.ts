import { Hono } from 'hono';
import type { Env } from './types';
import { publicApi } from './routes/public-api';
import { adminApi } from './routes/admin-api';
import { filesApi } from './routes/files-api';
import { importApi } from './routes/import-api';
import { exportApi } from './routes/export-api';
import { ratingApi } from './routes/rating-api';
import { pages } from './routes/pages';

type Bindings = { DB: D1Database; FILES: R2Bucket };

const app = new Hono<{ Bindings: Bindings }>();

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

export default app;
