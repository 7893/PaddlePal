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

// 离线操作日志同步 (Offline-First OpLog Sync)
app.post('/api/control/sync-oplog', async (c) => {
  const db = c.env.DB;
  const { matchId, oplogs } = await c.req.json<{
    matchId: number;
    oplogs: { opId: number; timestamp: number; type: string; payload: Record<string, any> }[];
  }>();

  // 简单的冲突合并逻辑：在架构设计中，我们将以最后一条 OpLog 为基准对数据库进行幂等追平
  // 在真实高并发场景下，可交由 Durable Objects 基于 CRDT 进行状态合并
  if (oplogs && oplogs.length > 0) {
    const lastOp = oplogs[oplogs.length - 1];
    if (lastOp.type === 'SCORE_UPDATE') {
      const { l, r, set_number } = lastOp.payload;
      await db
        .prepare('UPDATE scores SET p1_score = ?, p2_score = ? WHERE match_id = ? AND set_number = ?')
        .bind(l, r, matchId, set_number)
        .run();
    }
  }

  return c.json({ success: true, synced: oplogs?.length || 0 });
});

export { app as controlApi };
