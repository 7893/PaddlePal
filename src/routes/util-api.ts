import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 实时比分 SSE
app.get('/api/sse/live', async (c) => {
  const db = c.env.DB;

  const { results: matches } = await db
    .prepare(
      `
    SELECT m.id, m.table_no, m.status,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2,
      COALESCE(m.score1,0) as score1, COALESCE(m.score2,0) as score2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.status = 'playing'
  `
    )
    .all();

  const data = JSON.stringify({ matches, time: new Date().toISOString() });

  return new Response(`data: ${data}\n\n`, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});

// 仪表盘统计
app.get('/api/dashboard', async (c) => {
  const db = c.env.DB;

  const stats = await db
    .prepare(
      `
    SELECT
      (SELECT COUNT(*) FROM players WHERE tournament_id = 1) as players,
      (SELECT COUNT(*) FROM teams WHERE tournament_id = 1) as teams,
      (SELECT COUNT(*) FROM matches) as total_matches,
      (SELECT COUNT(*) FROM matches WHERE status = 'finished') as finished,
      (SELECT COUNT(*) FROM matches WHERE status = 'playing') as playing,
      (SELECT COUNT(*) FROM matches WHERE status = 'scheduled') as scheduled
  `
    )
    .first();

  const { results: recentResults } = await db
    .prepare(
      `
    SELECT m.id, COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, m.score1, m.score2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.status = 'finished'
    ORDER BY m.id DESC LIMIT 5
  `
    )
    .all();

  return c.json({ stats, recentResults });
});

// 搜索 API
app.get('/api/search', async (c) => {
  const db = c.env.DB;
  const q = c.req.query('q') || '';

  if (q.length < 2) return c.json({ players: [], matches: [] });

  const { results: players } = await db
    .prepare(
      `
    SELECT p.id, p.name, COALESCE(t.name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.name LIKE ? LIMIT 10
  `
    )
    .bind(`%${q}%`)
    .all();

  const { results: matches } = await db
    .prepare(
      `
    SELECT m.id, m.time, COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, m.status
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE p1.name LIKE ? OR p2.name LIKE ?
    LIMIT 10
  `
    )
    .bind(`%${q}%`, `%${q}%`)
    .all();

  return c.json({ players, matches });
});

// 健康检查
app.get('/api/health', async (c) => {
  const db = c.env.DB;
  try {
    await db.prepare('SELECT 1').first();
    return c.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch {
    return c.json({ status: 'error', db: 'disconnected' }, 500);
  }
});

// 版本信息
app.get('/api/version', (c) =>
  c.json({
    name: 'PaddlePal',
    version: '1.0.0',
    build: '2026-02-23',
  })
);

export { app as utilApi };
