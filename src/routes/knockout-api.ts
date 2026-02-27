import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 计算循环赛积分
app.post('/api/standings/:eventKey/calculate', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.param('eventKey');

  const event = await db.prepare('SELECT id FROM events WHERE key = ?').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 获取所有小组
  const { results: groups } = await db.prepare('SELECT id FROM group_tables WHERE event_id = ?').bind(event.id).all();

  for (const group of groups) {
    // 获取该组选手
    const { results: entries } = await db
      .prepare('SELECT player_id FROM group_entries WHERE group_id = ?')
      .bind(group.id)
      .all();

    for (const entry of entries) {
      const playerId = entry.player_id;

      // 计算战绩
      const stats = await db
        .prepare(
          `
        SELECT
          COUNT(*) as played,
          SUM(CASE WHEN (m.player1_id = ? AND m.winner_side = 1) OR (m.player2_id = ? AND m.winner_side = 2) THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN m.player1_id = ? THEN m.score1 ELSE m.score2 END) as games_won,
          SUM(CASE WHEN m.player1_id = ? THEN m.score2 ELSE m.score1 END) as games_lost
        FROM matches m
        WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.event_id = ? AND m.status = 'finished'
      `
        )
        .bind(playerId, playerId, playerId, playerId, playerId, playerId, event.id)
        .first();

      const points = ((stats?.wins as number) || 0) * 2;
      const gd = ((stats?.games_won as number) || 0) - ((stats?.games_lost as number) || 0);

      // 更新积分
      await db
        .prepare(
          `
        UPDATE group_entries SET points = ?, games_won = ?, games_lost = ?, game_diff = ?
        WHERE group_id = ? AND player_id = ?
      `
        )
        .bind(points, stats?.games_won || 0, stats?.games_lost || 0, gd, group.id, playerId)
        .run();
    }
  }

  return c.json({ success: true });
});

// 晋级到淘汰赛
app.post('/api/standings/:eventKey/advance', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.param('eventKey');
  const { advanceCount = 2 } = await c.req.json<{ advanceCount?: number }>();

  const event = await db.prepare('SELECT id FROM events WHERE key = ?').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 获取各组前N名
  const { results: groups } = await db
    .prepare('SELECT id, name FROM group_tables WHERE event_id = ? ORDER BY name')
    .bind(event.id)
    .all();

  const advanced: any[] = [];
  for (const group of groups) {
    const { results: topPlayers } = await db
      .prepare(
        `
      SELECT ge.player_id, p.name, ge.points, ge.game_diff
      FROM group_entries ge
      JOIN players p ON ge.player_id = p.id
      WHERE ge.group_id = ?
      ORDER BY ge.points DESC, ge.game_diff DESC
      LIMIT ?
    `
      )
      .bind(group.id, advanceCount)
      .all();

    advanced.push({ group: group.name, players: topPlayers });
  }

  return c.json({ success: true, advanced });
});

// 生成淘汰赛对阵
app.post('/api/knockout/:eventKey/generate', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.param('eventKey');
  const { playerIds } = await c.req.json<{ playerIds: number[] }>();

  const event = await db.prepare('SELECT id FROM events WHERE key = ?').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const count = playerIds.length;
  const drawSize = count <= 4 ? 4 : count <= 8 ? 8 : count <= 16 ? 16 : 32;
  const rounds = Math.log2(drawSize);

  // 清除现有淘汰赛
  await db.prepare('DELETE FROM matches WHERE event_id = ? AND round > 0').bind(event.id).run();

  // 生成第一轮
  const batch: any[] = [];
  let matchOrder = 1;
  let pos = 1;

  for (let i = 0; i < drawSize / 2; i++) {
    const p1Idx = i * 2;
    const p2Idx = i * 2 + 1;
    const p1 = playerIds[p1Idx] || null;
    const p2 = playerIds[p2Idx] || null;

    batch.push(
      db
        .prepare(
          `
        INSERT INTO matches (event_id, match_order, round, bracket_pos, player1_id, player2_id, status)
        VALUES (?, ?, 1, ?, ?, ?, 'scheduled')
      `
        )
        .bind(event.id, matchOrder++, pos++, p1, p2)
    );
  }

  // 生成后续轮次空位
  for (let r = 2; r <= rounds; r++) {
    const matchesInRound = drawSize / Math.pow(2, r);
    for (let i = 0; i < matchesInRound; i++) {
      batch.push(
        db
          .prepare(
            `
          INSERT INTO matches (event_id, match_order, round, bracket_pos, status)
          VALUES (?, ?, ?, ?, 'scheduled')
        `
          )
          .bind(event.id, matchOrder++, r, i + 1)
      );
    }
  }

  await db.batch(batch);

  return c.json({ success: true, drawSize, rounds, matches: matchOrder - 1 });
});

// 晋级选手到下一轮
app.post('/api/knockout/advance/:matchId', async (c) => {
  const db = c.env.DB;
  const matchId = c.req.param('matchId');

  const match = await db
    .prepare(
      `
    SELECT event_id, round, bracket_pos, winner_side, player1_id, player2_id
    FROM matches WHERE id = ?
  `
    )
    .bind(matchId)
    .first();

  if (!match || !match.winner_side) return c.json({ error: 'No winner' }, 400);

  const winnerId = match.winner_side === 1 ? match.player1_id : match.player2_id;
  const nextRound = (match.round as number) + 1;
  const nextPos = Math.ceil((match.bracket_pos as number) / 2);
  const slot = (match.bracket_pos as number) % 2 === 1 ? 'player1_id' : 'player2_id';

  await db
    .prepare(
      `
    UPDATE matches SET ${slot} = ?
    WHERE event_id = ? AND round = ? AND bracket_pos = ?
  `
    )
    .bind(winnerId, match.event_id, nextRound, nextPos)
    .run();

  return c.json({ success: true, winnerId, nextRound, nextPos });
});

export { app as knockoutApi };
