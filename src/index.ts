import { Hono } from 'hono';
import type { Env } from './types';
import { publicApi } from './routes/public-api';
import { adminApi } from './routes/admin-api';
import { pages } from './routes/pages';

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>();

// SSR pages
app.route('/', pages);

// Public JSON API (legacy compat)
app.route('/', publicApi);

// Admin JSON API
app.route('/', adminApi);

export default app;
