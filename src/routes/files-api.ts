import { Hono } from 'hono';

type Bindings = { DB: D1Database; FILES: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

// R2 path prefixes
const PREFIXES = ['templates', 'uploads', 'exports', 'assets'] as const;
type Prefix = typeof PREFIXES[number];

function buildKey(prefix: Prefix, tournamentId: string | null, filename: string): string {
  return tournamentId ? `${prefix}/${tournamentId}/${filename}` : `${prefix}/${filename}`;
}

// Upload file: POST /api/files/:prefix/:filename or /api/files/:prefix/:tournamentId/:filename
app.post('/api/files/:prefix/:a/:b?', async (c) => {
  const { prefix, a, b } = c.req.param();
  if (!PREFIXES.includes(prefix as Prefix)) {
    return c.json({ error: 'Invalid prefix' }, 400);
  }
  const [tournamentId, filename] = b ? [a, b] : [null, a];
  const key = buildKey(prefix as Prefix, tournamentId, filename);
  const body = await c.req.arrayBuffer();
  await c.env.FILES.put(key, body, {
    httpMetadata: { contentType: c.req.header('Content-Type') || 'application/octet-stream' }
  });
  return c.json({ key });
});

// Download file: GET /api/files/:prefix/:filename or /api/files/:prefix/:tournamentId/:filename
app.get('/api/files/:prefix/:a/:b?', async (c) => {
  const { prefix, a, b } = c.req.param();
  if (!PREFIXES.includes(prefix as Prefix)) {
    return c.json({ error: 'Invalid prefix' }, 400);
  }
  const [tournamentId, filename] = b ? [a, b] : [null, a];
  const key = buildKey(prefix as Prefix, tournamentId, filename);
  const obj = await c.env.FILES.get(key);
  if (!obj) return c.json({ error: 'Not found' }, 404);
  return new Response(obj.body, {
    headers: { 'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream' }
  });
});

// List files: GET /api/files/:prefix or /api/files/:prefix/:tournamentId
app.get('/api/files-list/:prefix/:tournamentId?', async (c) => {
  const { prefix, tournamentId } = c.req.param();
  if (!PREFIXES.includes(prefix as Prefix)) {
    return c.json({ error: 'Invalid prefix' }, 400);
  }
  const listPrefix = tournamentId ? `${prefix}/${tournamentId}/` : `${prefix}/`;
  const list = await c.env.FILES.list({ prefix: listPrefix });
  return c.json({ files: list.objects.map(o => ({ key: o.key, size: o.size })) });
});

// Delete file: DELETE /api/files/:prefix/:a/:b?
app.delete('/api/files/:prefix/:a/:b?', async (c) => {
  const { prefix, a, b } = c.req.param();
  if (!PREFIXES.includes(prefix as Prefix)) {
    return c.json({ error: 'Invalid prefix' }, 400);
  }
  const [tournamentId, filename] = b ? [a, b] : [null, a];
  const key = buildKey(prefix as Prefix, tournamentId, filename);
  await c.env.FILES.delete(key);
  return c.json({ deleted: key });
});

export { app as filesApi };
