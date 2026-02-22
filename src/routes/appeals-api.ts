import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 申诉列表
app.get('/api/appeals', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT a.id, a.match_id, a.player_id, a.reason, a.status, a.created_at, a.resolved_at, a.resolution,
      p.name as player_name, m.match_order
    FROM appeals a
    LEFT JOIN players p ON a.player_id = p.id
    LEFT JOIN matches m ON a.match_id = m.id
    ORDER BY a.created_at DESC
  `).all();
  return c.json({ appeals: results });
});

// 提交申诉
app.post('/api/appeals', async (c) => {
  const db = c.env.DB;
  const { match_id, player_id, reason } = await c.req.json<{ match_id: number; player_id: number; reason: string }>();

  if (!match_id || !reason) return c.json({ error: '参数不完整' }, 400);

  await db.prepare(`
    INSERT INTO appeals (match_id, player_id, reason, status, created_at)
    VALUES (?, ?, ?, 'pending', datetime('now'))
  `).bind(match_id, player_id || null, reason).run();

  return c.json({ success: true });
});

// 处理申诉
app.post('/api/appeals/:id/resolve', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { status, resolution } = await c.req.json<{ status: 'approved' | 'rejected'; resolution: string }>();

  await db.prepare(`
    UPDATE appeals SET status = ?, resolution = ?, resolved_at = datetime('now') WHERE id = ?
  `).bind(status, resolution, id).run();

  return c.json({ success: true });
});

export { app as appealsApi };
