import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 订阅通知
app.post('/api/notify/subscribe', async (c) => {
  const db = c.env.DB;
  const { player_id, endpoint } = await c.req.json<{ player_id?: number; endpoint: string }>();

  if (!endpoint) return c.json({ error: '缺少 endpoint' }, 400);

  // 简单存储订阅信息
  await db.prepare(`
    INSERT OR REPLACE INTO subscriptions (endpoint, player_id, created_at)
    VALUES (?, ?, datetime('now'))
  `).bind(endpoint, player_id || null).run();

  return c.json({ success: true });
});

// 获取选手即将开始的比赛
app.get('/api/notify/upcoming/:playerId', async (c) => {
  const db = c.env.DB;
  const playerId = c.req.param('playerId');

  const { results } = await db.prepare(`
    SELECT m.id, m.time, m.table_no, e.title as event,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m
    LEFT JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.status = 'scheduled'
    ORDER BY m.time
    LIMIT 5
  `).bind(playerId, playerId).all();

  return c.json({ matches: results });
});

// 发送通知 (内部调用)
app.post('/api/notify/send', async (c) => {
  const { title, body, player_id } = await c.req.json<{ title: string; body: string; player_id?: number }>();

  // 这里简化处理，实际需要 Web Push 或其他推送服务
  // 返回通知内容供前端轮询
  return c.json({ success: true, notification: { title, body, player_id, time: new Date().toISOString() } });
});

// 获取最新通知 (前端轮询)
app.get('/api/notify/latest', async (c) => {
  const db = c.env.DB;

  // 获取最近开始的比赛作为通知
  const { results } = await db.prepare(`
    SELECT m.id, m.time, m.table_no, e.title as event,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m
    LEFT JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.status = 'playing'
    ORDER BY m.id DESC
    LIMIT 5
  `).all();

  const notifications = results.map(m => ({
    title: `${m.table_no}号台比赛开始`,
    body: `${m.event}: ${m.p1} vs ${m.p2}`,
    time: m.time
  }));

  return c.json({ notifications });
});

export { app as notifyApi };
