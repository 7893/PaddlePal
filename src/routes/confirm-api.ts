import { Hono } from 'hono';
import { hasPermission } from './auth';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 确认比分 (仅裁判长/副裁判长)
app.post('/api/confirm/:matchId', async (c) => {
  const db = c.env.DB;
  const matchId = c.req.param('matchId');
  const user = (c as any).get('user');

  if (!user || !hasPermission(user.role, 'admin')) {
    return c.json({ error: '权限不足' }, 403);
  }

  // 只能确认已完成的比赛
  const match = await db.prepare('SELECT status FROM matches WHERE id = ?').bind(matchId).first();
  if (!match || match.status !== 'finished') {
    return c.json({ error: '只能确认已完成的比赛' }, 400);
  }

  await db
    .prepare(
      `
    UPDATE matches SET confirmed = 1, confirmed_by = ?, confirmed_at = datetime('now')
    WHERE id = ?
  `
    )
    .bind(user.name, matchId)
    .run();

  return c.json({ success: true });
});

// 批量确认
app.post('/api/confirm/batch', async (c) => {
  const db = c.env.DB;
  const user = (c as any).get('user');
  const { matchIds } = await c.req.json<{ matchIds: number[] }>();

  if (!user || !hasPermission(user.role, 'admin')) {
    return c.json({ error: '权限不足' }, 403);
  }

  if (!matchIds?.length) return c.json({ error: '无效参数' }, 400);

  const placeholders = matchIds.map(() => '?').join(',');
  await db
    .prepare(
      `
    UPDATE matches SET confirmed = 1, confirmed_by = ?, confirmed_at = datetime('now')
    WHERE id IN (${placeholders}) AND status = 'finished'
  `
    )
    .bind(user.name, ...matchIds)
    .run();

  return c.json({ success: true, count: matchIds.length });
});

// 撤销确认 (仅裁判长)
app.post('/api/confirm/:matchId/revoke', async (c) => {
  const db = c.env.DB;
  const matchId = c.req.param('matchId');
  const user = (c as any).get('user');

  if (!user || user.role !== 'referee') {
    return c.json({ error: '仅裁判长可撤销确认' }, 403);
  }

  await db
    .prepare('UPDATE matches SET confirmed = 0, confirmed_by = NULL, confirmed_at = NULL WHERE id = ?')
    .bind(matchId)
    .run();

  return c.json({ success: true });
});

// 获取待确认列表
app.get('/api/confirm/pending', async (c) => {
  const db = c.env.DB;

  const { results } = await db
    .prepare(
      `
    SELECT m.id, m.match_order, m.time, e.title as event,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2,
      m.score1, m.score2, m.games
    FROM matches m
    LEFT JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.status = 'finished' AND m.confirmed = 0
    ORDER BY m.time DESC
  `
    )
    .all();

  return c.json({ matches: results });
});

export { app as confirmApi };
