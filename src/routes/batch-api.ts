import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 批量更新比分
app.post('/api/batch/scores', async (c) => {
  const db = c.env.DB;
  const { matches } = await c.req.json<{ matches: { id: number; score1: number; score2: number }[] }>();

  const batch = matches.map(m => 
    db.prepare("UPDATE matches SET score1 = ?, score2 = ?, status = 'finished', winner_side = ? WHERE id = ?")
      .bind(m.score1, m.score2, m.score1 > m.score2 ? 1 : m.score2 > m.score1 ? 2 : 0, m.id)
  );

  await db.batch(batch);
  return c.json({ success: true, count: matches.length });
});

// 批量更新球台
app.post('/api/batch/tables', async (c) => {
  const db = c.env.DB;
  const { assignments } = await c.req.json<{ assignments: { matchId: number; tableNo: number }[] }>();

  const batch = assignments.map(a =>
    db.prepare('UPDATE matches SET table_no = ? WHERE id = ?').bind(a.tableNo, a.matchId)
  );

  await db.batch(batch);
  return c.json({ success: true, count: assignments.length });
});

// 批量更新时间
app.post('/api/batch/times', async (c) => {
  const db = c.env.DB;
  const { updates } = await c.req.json<{ updates: { matchId: number; time: string }[] }>();

  const batch = updates.map(u =>
    db.prepare('UPDATE matches SET time = ? WHERE id = ?').bind(u.time, u.matchId)
  );

  await db.batch(batch);
  return c.json({ success: true, count: updates.length });
});

// 重置比赛状态
app.post('/api/batch/reset', async (c) => {
  const db = c.env.DB;
  const { matchIds } = await c.req.json<{ matchIds: number[] }>();

  const placeholders = matchIds.map(() => '?').join(',');
  await db.prepare(`UPDATE matches SET status = 'scheduled', score1 = NULL, score2 = NULL, winner_side = NULL, confirmed = 0 WHERE id IN (${placeholders})`).bind(...matchIds).run();
  await db.prepare(`DELETE FROM scores WHERE match_id IN (${placeholders})`).bind(...matchIds).run();

  return c.json({ success: true, count: matchIds.length });
});

// 复制赛程模板
app.post('/api/template/copy', async (c) => {
  const db = c.env.DB;
  const { sourceEventId, targetEventId } = await c.req.json<{ sourceEventId: number; targetEventId: number }>();

  const { results: sourceMatches } = await db.prepare(`
    SELECT round, time, table_no, bracket_pos FROM matches WHERE event_id = ? ORDER BY match_order
  `).bind(sourceEventId).all();

  let order = 1;
  for (const m of sourceMatches) {
    await db.prepare(`
      INSERT INTO matches (event_id, match_order, round, time, table_no, bracket_pos, status)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
    `).bind(targetEventId, order++, m.round, m.time, m.table_no, m.bracket_pos).run();
  }

  return c.json({ success: true, copied: sourceMatches.length });
});

export { app as batchApi };
