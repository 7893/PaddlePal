import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 检录 API
app.post('/api/checkin/:matchId', async (c) => {
  const db = c.env.DB;
  const matchId = c.req.param('matchId');
  const { side } = await c.req.json<{ side: 1 | 2 }>();

  const field = side === 1 ? 'checkin1' : 'checkin2';
  await db.prepare(`UPDATE matches SET ${field} = 1 WHERE id = ?`).bind(matchId).run();

  // 检查双方是否都已检录
  const match = await db.prepare('SELECT checkin1, checkin2 FROM matches WHERE id = ?').bind(matchId).first();
  if (match?.checkin1 && match?.checkin2) {
    await db.prepare("UPDATE matches SET status = 'playing' WHERE id = ?").bind(matchId).run();
  }

  return c.json({ success: true, bothReady: !!(match?.checkin1 && match?.checkin2) });
});

// 取消检录
app.post('/api/checkin/:matchId/cancel', async (c) => {
  const db = c.env.DB;
  const matchId = c.req.param('matchId');

  await db.prepare("UPDATE matches SET checkin1 = 0, checkin2 = 0, status = 'scheduled' WHERE id = ?").bind(matchId).run();
  return c.json({ success: true });
});

// 获取检录状态
app.get('/api/checkin/:matchId', async (c) => {
  const db = c.env.DB;
  const matchId = c.req.param('matchId');

  const match = await db.prepare(`
    SELECT m.checkin1, m.checkin2, m.status,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.id = ?
  `).bind(matchId).first();

  return c.json(match || { error: 'Not found' });
});

// 批量获取待检录比赛
app.get('/api/checkin/pending', async (c) => {
  const db = c.env.DB;

  const { results } = await db.prepare(`
    SELECT m.id, m.time, m.table_no, m.checkin1, m.checkin2, e.title as event,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m
    LEFT JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.status = 'scheduled'
    ORDER BY m.time, m.table_no
    LIMIT 20
  `).all();

  return c.json({ matches: results });
});

export { app as checkinApi };
