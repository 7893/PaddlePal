import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 贝格尔轮转表（循环赛对阵顺序）
function bergerTable(n: number): number[][][] {
  const rounds: number[][][] = [];
  const players = Array.from({ length: n }, (_, i) => i + 1);

  // 如果是奇数，添加轮空位
  if (n % 2 === 1) {
    players.push(0);
  }
  const count = players.length;
  const roundCount = count - 1;

  for (let r = 0; r < roundCount; r++) {
    const matches: number[][] = [];
    for (let i = 0; i < count / 2; i++) {
      const p1 = players[i];
      const p2 = players[count - 1 - i];
      if (p1 !== 0 && p2 !== 0) {
        matches.push([p1, p2]);
      }
    }
    rounds.push(matches);
    // 轮转：固定第一个位置，其他顺时针轮转
    const last = players.pop()!;
    players.splice(1, 0, last);
  }
  return rounds;
}

// 获取赛程编排状态: GET /api/schedule/:eventKey
app.get('/api/schedule/:eventKey', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db
    .prepare('SELECT id, title FROM events WHERE key = ? AND tournament_id = 1')
    .bind(eventKey)
    .first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const { results: matches } = await db
    .prepare(
      `
    SELECT m.id, m.match_order as pid, m.round, m.time, m.table_no,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, m.status
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.event_id = ?
    ORDER BY m.round, m.match_order
  `
    )
    .bind(event.id)
    .all();

  return c.json({ event: event.title, matches });
});

// 生成循环赛赛程: POST /api/schedule/:eventKey/roundrobin
app.post('/api/schedule/:eventKey/roundrobin', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;
  const body = await c.req.json<{ tableCount: number; startTime: string; minutesPerMatch: number }>();
  const { tableCount = 6, startTime = '08:30', minutesPerMatch = 15 } = body;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 清除现有赛程
  await db.prepare('DELETE FROM matches WHERE event_id = ?').bind(event.id).run();

  // 获取所有小组
  const { results: groups } = await db
    .prepare('SELECT id, name FROM group_tables WHERE event_id = ? ORDER BY name')
    .bind(event.id)
    .all();

  let matchOrder = 1;
  const batch: any[] = [];

  // 解析开始时间
  const [startHour, startMin] = startTime.split(':').map(Number);
  let currentMinutes = startHour * 60 + startMin;
  let currentTable = 1;

  for (const group of groups) {
    // 获取该组选手
    const { results: players } = await db
      .prepare(
        `
      SELECT ge.player_id, ge.position FROM group_entries ge WHERE ge.group_id = ? ORDER BY ge.position
    `
      )
      .bind(group.id)
      .all();

    if (players.length < 2) continue;

    // 生成贝格尔轮转表
    const rounds = bergerTable(players.length);

    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
      const roundMatches = rounds[roundIdx];

      for (const [pos1, pos2] of roundMatches) {
        const player1 = players.find((p) => p.position === pos1);
        const player2 = players.find((p) => p.position === pos2);

        if (!player1 || !player2) continue;

        const timeHour = Math.floor(currentMinutes / 60);
        const timeMin = currentMinutes % 60;
        const timeStr = `${timeHour.toString().padStart(2, '0')}:${timeMin.toString().padStart(2, '0')}`;

        batch.push(
          db
            .prepare(
              `
            INSERT INTO matches (event_id, match_order, round, player1_id, player2_id, table_no, time, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
          `
            )
            .bind(event.id, matchOrder++, roundIdx + 1, player1.player_id, player2.player_id, currentTable, timeStr)
        );

        // 下一个球台
        currentTable++;
        if (currentTable > tableCount) {
          currentTable = 1;
          currentMinutes += minutesPerMatch;
        }
      }
    }
  }

  if (batch.length > 0) {
    await db.batch(batch);
  }

  return c.json({ success: true, matchCount: batch.length });
});

// 生成淘汰赛赛程: POST /api/schedule/:eventKey/knockout
app.post('/api/schedule/:eventKey/knockout', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;
  const body = await c.req.json<{
    playerCount: number;
    tableCount: number;
    startTime: string;
    minutesPerMatch: number;
  }>();
  const { playerCount = 8, tableCount = 4, startTime = '14:00', minutesPerMatch = 20 } = body;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 清除现有赛程
  await db.prepare('DELETE FROM matches WHERE event_id = ?').bind(event.id).run();

  // 计算轮次
  const drawSize = playerCount <= 4 ? 4 : playerCount <= 8 ? 8 : playerCount <= 16 ? 16 : 32;
  const totalRounds = Math.log2(drawSize);

  const batch: any[] = [];
  let matchOrder = 1;

  const [startHour, startMin] = startTime.split(':').map(Number);
  let currentMinutes = startHour * 60 + startMin;
  let currentTable = 1;

  // 生成每轮比赛
  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = drawSize / Math.pow(2, round);

    for (let i = 0; i < matchesInRound; i++) {
      const timeHour = Math.floor(currentMinutes / 60);
      const timeMin = currentMinutes % 60;
      const timeStr = `${timeHour.toString().padStart(2, '0')}:${timeMin.toString().padStart(2, '0')}`;

      batch.push(
        db
          .prepare(
            `
          INSERT INTO matches (event_id, match_order, round, table_no, time, status)
          VALUES (?, ?, ?, ?, ?, 'scheduled')
        `
          )
          .bind(event.id, matchOrder++, round, currentTable, timeStr)
      );

      currentTable++;
      if (currentTable > tableCount) {
        currentTable = 1;
        currentMinutes += minutesPerMatch;
      }
    }
    // 每轮之间间隔
    currentMinutes += minutesPerMatch;
  }

  if (batch.length > 0) {
    await db.batch(batch);
  }

  return c.json({ success: true, matchCount: batch.length, rounds: totalRounds });
});

// 调整场次: POST /api/schedule/:eventKey/adjust
app.post('/api/schedule/:eventKey/adjust', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{ matchId: number; tableNo?: number; time?: string }>();

  const updates: string[] = [];
  const params: any[] = [];

  if (body.tableNo !== undefined) {
    updates.push('table_no = ?');
    params.push(body.tableNo);
  }
  if (body.time !== undefined) {
    updates.push('time = ?');
    params.push(body.time);
  }

  if (updates.length === 0) return c.json({ error: 'No updates' }, 400);

  params.push(body.matchId);
  await db
    .prepare(`UPDATE matches SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();

  return c.json({ success: true });
});

// 清除赛程: POST /api/schedule/:eventKey/clear
app.post('/api/schedule/:eventKey/clear', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  await db.prepare('DELETE FROM matches WHERE event_id = ?').bind(event.id).run();

  return c.json({ success: true });
});

export { app as scheduleApi };
