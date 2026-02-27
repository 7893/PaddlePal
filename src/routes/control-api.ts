import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 开始比赛
app.post('/api/control/start', async (c) => {
  const db = c.env.DB;
  const { matchId } = await c.req.json<{ matchId: number }>();

  await db.prepare("UPDATE matches SET status = 'playing' WHERE id = ?").bind(matchId).run();
  return c.json({ success: true });
});

// 结束比赛
app.post('/api/control/finish', async (c) => {
  const db = c.env.DB;
  const { matchId } = await c.req.json<{ matchId: number }>();

  await db.prepare("UPDATE matches SET status = 'finished' WHERE id = ?").bind(matchId).run();
  return c.json({ success: true });
});

// 换台
app.post('/api/control/reassign', async (c) => {
  const db = c.env.DB;
  const { matchId, tableNo } = await c.req.json<{ matchId: number; tableNo: number }>();

  await db.prepare('UPDATE matches SET table_no = ? WHERE id = ?').bind(tableNo, matchId).run();
  return c.json({ success: true });
});

// 获取所有球台状态
app.get('/api/control/status', async (c) => {
  const db = c.env.DB;

  const { results: matches } = await db
    .prepare(
      `
    SELECT m.id, m.table_no, m.time, m.status,
      COALESCE(p1.name,'TBD') as p1, COALESCE(p2.name,'TBD') as p2,
      COALESCE(m.score1,0) as score1, COALESCE(m.score2,0) as score2,
      e.title as event_title
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN events e ON m.event_id = e.id
    WHERE m.status IN ('scheduled', 'playing')
    ORDER BY m.time, m.table_no
  `
    )
    .all();

  return c.json({ matches });
});

export { app as controlApi };
