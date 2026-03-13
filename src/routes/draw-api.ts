import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// ============ 分组循环抽签 ============

// 获取分组循环抽签状态: GET /api/draw/roundrobin/:eventKey
app.get('/api/draw/roundrobin/:eventKey', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db
    .prepare('SELECT id, title FROM events WHERE key = ? AND tournament_id = 1')
    .bind(eventKey)
    .first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 获取所有小组
  const { results: groups } = await db
    .prepare(
      `
    SELECT id, name FROM group_tables WHERE event_id = ? ORDER BY name
  `
    )
    .bind(event.id)
    .all();

  // 获取每组的选手
  const groupsWithPlayers = [];
  for (const g of groups) {
    const { results: players } = await db
      .prepare(
        `
      SELECT ge.position, ge.seed, p.id as player_id, p.name, COALESCE(t.short_name,'') as team, t.id as team_id
      FROM group_entries ge
      JOIN players p ON ge.player_id = p.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE ge.group_id = ?
      ORDER BY ge.position
    `
      )
      .bind(g.id)
      .all();
    groupsWithPlayers.push({ id: g.id, name: g.name, players });
  }

  // 获取待抽选手
  const { results: unassigned } = await db
    .prepare(
      `
    SELECT p.id, p.name, COALESCE(t.short_name,'') as team, t.id as team_id, p.rating
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.tournament_id = 1
    AND p.id NOT IN (SELECT player_id FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?))
    ORDER BY p.rating DESC
  `
    )
    .bind(event.id)
    .all();

  return c.json({ event: event.title, groups: groupsWithPlayers, unassigned });
});

// 执行分组循环抽签: POST /api/draw/roundrobin/:eventKey/execute
app.post('/api/draw/roundrobin/:eventKey/execute', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;
  const body = await c.req.json<{ groupCount: number; seedCount: number; separateTeams: boolean }>();
  const { groupCount = 4, seedCount = 0, separateTeams = true } = body;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 清除现有分组
  await db
    .prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)')
    .bind(event.id)
    .run();
  await db.prepare('DELETE FROM group_tables WHERE event_id = ?').bind(event.id).run();

  // 创建小组
  const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  await db.batch(
    Array.from({ length: groupCount }, (_, i) =>
      db.prepare('INSERT INTO group_tables (event_id, name) VALUES (?, ?)').bind(event.id, groupNames[i])
    )
  );

  // 获取新创建的小组
  const { results: groups } = await db
    .prepare('SELECT id, name FROM group_tables WHERE event_id = ? ORDER BY name')
    .bind(event.id)
    .all();

  // 获取所有选手（按积分排序）
  const { results: players } = await db
    .prepare(
      `
    SELECT p.id, p.name, p.team_id, p.rating FROM players p WHERE p.tournament_id = 1 ORDER BY p.rating DESC
  `
    )
    .bind()
    .all();

  if (players.length === 0) return c.json({ error: 'No players found' }, 400);

  // 分配种子选手（蛇形分配到各组1号位）
  const seeds = players.slice(0, Math.min(seedCount, groupCount));
  const nonSeeds = players.slice(seeds.length);

  // 种子选手分配到各组1号位
  const seedStmts = seeds.map((s, i) =>
    db
      .prepare('INSERT INTO group_entries (group_id, player_id, position, seed) VALUES (?, ?, 1, 1)')
      .bind(groups[i].id, s.id)
  );
  if (seedStmts.length > 0) await db.batch(seedStmts);

  // 非种子选手随机分配，同队分开
  let shuffled = [...nonSeeds].sort(() => Math.random() - 0.5);

  if (separateTeams) {
    // 同队分开算法：按队伍分组，然后交替分配
    const byTeam: Record<number, typeof shuffled> = {};
    for (const p of shuffled) {
      const tid = (p.team_id as number) || 0;
      if (!byTeam[tid]) byTeam[tid] = [];
      byTeam[tid].push(p);
    }
    // 重新排列：轮流从各队取人
    shuffled = [];
    const teams = Object.values(byTeam);
    const maxLen = Math.max(...teams.map((t) => t.length));
    for (let i = 0; i < maxLen; i++) {
      for (const team of teams) {
        if (team[i]) shuffled.push(team[i]);
      }
    }
  }

  // 蛇形分配到各组
  const groupPositions: number[] = new Array(groupCount).fill(seeds.length > 0 ? 2 : 1);
  let direction = 1;
  let groupIdx = 0;
  const nonSeedStmts = [];

  for (const player of shuffled) {
    const groupId = groups[groupIdx].id;
    const position = groupPositions[groupIdx];
    nonSeedStmts.push(
      db
        .prepare('INSERT INTO group_entries (group_id, player_id, position, seed) VALUES (?, ?, ?, 0)')
        .bind(groupId, player.id, position)
    );
    groupPositions[groupIdx]++;
    groupIdx += direction;
    if (groupIdx >= groupCount) {
      groupIdx = groupCount - 1;
      direction = -1;
    } else if (groupIdx < 0) {
      groupIdx = 0;
      direction = 1;
    }
  }
  if (nonSeedStmts.length > 0) await db.batch(nonSeedStmts);

  return c.json({ success: true, groupCount, totalPlayers: players.length });
});

// 手工调整位置: POST /api/draw/roundrobin/:eventKey/move
app.post('/api/draw/roundrobin/:eventKey/move', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;
  const body = await c.req.json<{ playerId: number; targetGroupId: number; targetPosition: number }>();

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // 删除原位置
  await db
    .prepare(
      'DELETE FROM group_entries WHERE player_id = ? AND group_id IN (SELECT id FROM group_tables WHERE event_id = ?)'
    )
    .bind(body.playerId, event.id)
    .run();

  // 插入新位置
  await db
    .prepare('INSERT INTO group_entries (group_id, player_id, position, seed) VALUES (?, ?, ?, 0)')
    .bind(body.targetGroupId, body.playerId, body.targetPosition)
    .run();

  return c.json({ success: true });
});

// 重置分组: POST /api/draw/roundrobin/:eventKey/reset
app.post('/api/draw/roundrobin/:eventKey/reset', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  await db
    .prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)')
    .bind(event.id)
    .run();
  await db.prepare('DELETE FROM group_tables WHERE event_id = ?').bind(event.id).run();

  return c.json({ success: true });
});

// ============ 淘汰赛抽签 ============

// Get draw status: GET /api/draw/:eventKey/status
app.get('/api/draw/:eventKey/status', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db
    .prepare('SELECT id, title FROM events WHERE key = ? AND tournament_id = 1')
    .bind(eventKey)
    .first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const { results: entries } = await db
    .prepare(
      `
    SELECT d.position, d.seed, p.name as player, COALESCE(t.short_name,'') as team, p.rating, d.draw_time
    FROM draws d
    JOIN players p ON d.player_id = p.id
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE d.event_id = ?
    ORDER BY d.position
  `
    )
    .bind(event.id)
    .all();

  const totalPlayers = await db
    .prepare(
      `
    SELECT COUNT(*) as cnt FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
  `
    )
    .bind(event.id)
    .first();

  const total = (totalPlayers?.cnt as number) || 0;
  const status = entries.length === 0 ? 'pending' : entries.length >= total ? 'completed' : 'drawing';

  return c.json({ event: event.title, status, entries, totalPlayers: total });
});

// Start draw: POST /api/draw/:eventKey/start
app.post('/api/draw/:eventKey/start', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // Clear existing draws
  await db.prepare('DELETE FROM draws WHERE event_id = ?').bind(event.id).run();

  // Get seeded players first (top 8 seeds get fixed positions)
  const { results: seeded } = await db
    .prepare(
      `
    SELECT ge.player_id, p.name, ge.position as seed
    FROM group_entries ge
    JOIN players p ON ge.player_id = p.id
    WHERE ge.group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
    AND ge.position <= 8
    ORDER BY ge.position
  `
    )
    .bind(event.id)
    .all();

  // Place seeds in standard positions (1, 16, 9, 8, 5, 12, 13, 4 for 16-draw)
  const seedPositions: Record<number, number[]> = {
    8: [1, 8, 5, 4, 3, 6, 7, 2],
    16: [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2],
    32: [
      1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4, 3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18,
      31, 2,
    ],
  };

  const total = await db
    .prepare(
      `
    SELECT COUNT(*) as cnt FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
  `
    )
    .bind(event.id)
    .first();
  const totalPlayers = (total?.cnt as number) || 0;
  const drawSize = totalPlayers <= 8 ? 8 : totalPlayers <= 16 ? 16 : 32;
  const positions = seedPositions[drawSize] || seedPositions[16];

  // Place seeded players
  const seedBatch = seeded
    .slice(0, 8)
    .map((s, i) =>
      db
        .prepare(
          `INSERT INTO draws (event_id, player_id, seed, position, draw_time) VALUES (?, ?, ?, ?, datetime('now'))`
        )
        .bind(event.id, s.player_id, i + 1, positions[i])
    );
  if (seedBatch.length > 0) await db.batch(seedBatch);

  return c.json({ success: true, seededCount: Math.min(seeded.length, 8) });
});

// Draw next player: POST /api/draw/:eventKey/next
app.post('/api/draw/:eventKey/next', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // Get undrawn players
  const { results: undrawn } = await db
    .prepare(
      `
    SELECT ge.player_id, p.name
    FROM group_entries ge
    JOIN players p ON ge.player_id = p.id
    WHERE ge.group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
    AND ge.player_id NOT IN (SELECT player_id FROM draws WHERE event_id = ?)
  `
    )
    .bind(event.id, event.id)
    .all();

  if (undrawn.length === 0) return c.json({ error: 'All players drawn' }, 400);

  // Get available positions
  const total = await db
    .prepare(
      `
    SELECT COUNT(*) as cnt FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
  `
    )
    .bind(event.id)
    .first();
  const totalPlayers = (total?.cnt as number) || 0;
  const drawSize = totalPlayers <= 8 ? 8 : totalPlayers <= 16 ? 16 : 32;

  const { results: taken } = await db.prepare('SELECT position FROM draws WHERE event_id = ?').bind(event.id).all();
  const takenPositions = new Set(taken.map((t) => t.position as number));
  const available = Array.from({ length: drawSize }, (_, i) => i + 1).filter((p) => !takenPositions.has(p));

  if (available.length === 0) return c.json({ error: 'No positions available' }, 400);

  // Random selection
  const randomPlayer = undrawn[Math.floor(Math.random() * undrawn.length)];
  const randomPosition = available[Math.floor(Math.random() * available.length)];

  await db
    .prepare(
      `
    INSERT INTO draws (event_id, player_id, seed, position, draw_time)
    VALUES (?, ?, 0, ?, datetime('now'))
  `
    )
    .bind(event.id, randomPlayer.player_id, randomPosition)
    .run();

  return c.json({ success: true, player: randomPlayer.name, position: randomPosition });
});

// Auto complete draw: POST /api/draw/:eventKey/auto
app.post('/api/draw/:eventKey/auto', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  // Get undrawn players
  const { results: undrawn } = await db
    .prepare(
      `
    SELECT ge.player_id FROM group_entries ge
    WHERE ge.group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
    AND ge.player_id NOT IN (SELECT player_id FROM draws WHERE event_id = ?)
  `
    )
    .bind(event.id, event.id)
    .all();

  // Get available positions
  const total = await db
    .prepare(
      `
    SELECT COUNT(*) as cnt FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
  `
    )
    .bind(event.id)
    .first();
  const totalPlayers = (total?.cnt as number) || 0;
  const drawSize = totalPlayers <= 8 ? 8 : totalPlayers <= 16 ? 16 : 32;

  const { results: taken } = await db.prepare('SELECT position FROM draws WHERE event_id = ?').bind(event.id).all();
  const takenPositions = new Set(taken.map((t) => t.position as number));
  const available = Array.from({ length: drawSize }, (_, i) => i + 1).filter((p) => !takenPositions.has(p));

  // Shuffle both arrays
  const shuffledPlayers = [...undrawn].sort(() => Math.random() - 0.5);
  const shuffledPositions = [...available].sort(() => Math.random() - 0.5);

  // Assign remaining
  const batch = [];
  for (let i = 0; i < shuffledPlayers.length && i < shuffledPositions.length; i++) {
    batch.push(
      db
        .prepare(
          `INSERT INTO draws (event_id, player_id, seed, position, draw_time) VALUES (?, ?, 0, ?, datetime('now'))`
        )
        .bind(event.id, shuffledPlayers[i].player_id, shuffledPositions[i])
    );
  }

  if (batch.length > 0) await db.batch(batch);

  return c.json({ success: true, drawn: batch.length });
});

// Reset draw: POST /api/draw/:eventKey/reset
app.post('/api/draw/:eventKey/reset', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  await db.prepare('DELETE FROM draws WHERE event_id = ?').bind(event.id).run();

  return c.json({ success: true });
});

export { app as drawApi };
