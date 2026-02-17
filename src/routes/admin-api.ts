import { Hono } from 'hono';

type Bindings = { DB: D1Database };
export const adminApi = new Hono<{ Bindings: Bindings }>();

// POST /api/admin/match/save
adminApi.post('/api/admin/match/save', async (c) => {
  const { match_id, scores } = await c.req.json<{ match_id: number; scores: { game: number; left: number; right: number }[] }>();
  const db = c.env.DB;
  await db.prepare('DELETE FROM scores WHERE match_id=?').bind(match_id).run();
  let w1 = 0, w2 = 0;
  for (const s of scores) {
    await db.prepare('INSERT INTO scores (match_id, game_no, score_left, score_right) VALUES (?,?,?,?)').bind(match_id, s.game, s.left, s.right).run();
    if (s.left > s.right) w1++; else if (s.right > s.left) w2++;
  }
  const result = `${w1}:${w2}`;
  const winner = w1 > w2 ? 1 : w2 > w1 ? 2 : 0;
  await db.prepare('UPDATE matches SET result=?, status=?, winner_side=? WHERE id=?').bind(result, 'finished', winner, match_id).run();
  return c.json({ success: true, result });
});

// POST /api/admin/match/status
adminApi.post('/api/admin/match/status', async (c) => {
  const { match_id, status } = await c.req.json<{ match_id: number; status: string }>();
  await c.env.DB.prepare('UPDATE matches SET status=? WHERE id=?').bind(status, match_id).run();
  return c.json({ success: true });
});

// POST /api/admin/match/walkover
adminApi.post('/api/admin/match/walkover', async (c) => {
  const { match_id, walkover_side } = await c.req.json<{ match_id: number; walkover_side: number }>();
  const db = c.env.DB;
  const ev = await db.prepare('SELECT COALESCE(e.best_of,5) as bo FROM matches m JOIN events e ON m.event_id=e.id WHERE m.id=?').bind(match_id).first();
  const wn = Math.floor((ev?.bo as number || 5) / 2) + 1;
  let result: string, ws: number;
  if (walkover_side === 1) { result = `W-0:${wn}`; ws = 2; }
  else if (walkover_side === 2) { result = `${wn}:W-0`; ws = 1; }
  else if (walkover_side === 3) { result = '双弃权'; ws = 0; }
  else return c.json({ success: false, error: 'invalid side' });
  await db.prepare('DELETE FROM scores WHERE match_id=?').bind(match_id).run();
  if (walkover_side !== 3) {
    for (let i = 1; i <= wn; i++) {
      const [sl, sr] = walkover_side === 1 ? [65535, 11] : [11, 65535];
      await db.prepare('INSERT INTO scores (match_id, game_no, score_left, score_right) VALUES (?,?,?,?)').bind(match_id, i, sl, sr).run();
    }
  }
  await db.prepare("UPDATE matches SET result=?, status='finished', winner_side=? WHERE id=?").bind(result, ws, match_id).run();
  return c.json({ success: true, result });
});

// GET /api/admin/matches
adminApi.get('/api/admin/matches', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT m.match_order as pid, m.table_no as 'table', m.time, m.status, m.result,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    ORDER BY m.status DESC, m.time, m.match_order
  `).all();
  return c.json({ matches: results });
});

// GET /api/admin/control
adminApi.get('/api/admin/control', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare('SELECT COALESCE(tables_count,8) as tc FROM tournaments WHERE id=1').first();
  const { results: playing } = await db.prepare(`
    SELECT m.id, m.match_order as pid, m.table_no, m.time, m.status, m.result,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.event_type
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.status IN ('playing','finished') ORDER BY m.table_no
  `).all();
  const { results: queue } = await db.prepare(`
    SELECT m.match_order as pid, m.time, COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.status='scheduled' ORDER BY m.time, m.match_order LIMIT 20
  `).all();
  return c.json({ tables: t?.tc ?? 8, playing, queue });
});

// /api/admin/players
adminApi.get('/api/admin/players', async (c) => {
  const id = c.req.query('id');
  if (id) {
    const p = await c.env.DB.prepare('SELECT id, name, gender, COALESCE(team_id,0) as team_id FROM players WHERE id=?').bind(id).first();
    return c.json({ player: p });
  }
  const { results } = await c.env.DB.prepare(`SELECT p.id, p.name, p.gender, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY p.id`).all();
  return c.json({ players: results });
});

adminApi.post('/api/admin/players', async (c) => {
  const { id, name, gender, team_id } = await c.req.json<{ id?: number; name: string; gender: string; team_id?: number }>();
  if (!id) await c.env.DB.prepare('INSERT INTO players (tournament_id, name, gender, team_id) VALUES (1,?,?,?)').bind(name, gender, team_id || 0).run();
  else await c.env.DB.prepare('UPDATE players SET name=?, gender=?, team_id=? WHERE id=?').bind(name, gender, team_id || 0, id).run();
  return c.json({ success: true });
});

adminApi.delete('/api/admin/players', async (c) => {
  await c.env.DB.prepare('DELETE FROM players WHERE id=?').bind(c.req.query('id')).run();
  return c.json({ success: true });
});

// /api/admin/teams
adminApi.get('/api/admin/teams', async (c) => {
  const id = c.req.query('id');
  if (id) {
    const t = await c.env.DB.prepare("SELECT id, name, COALESCE(short_name,'') as short_name FROM teams WHERE id=?").bind(id).first();
    return c.json({ team: t });
  }
  const { results } = await c.env.DB.prepare(`SELECT t.id, t.name, COALESCE(t.short_name,'') as short_name,
    (SELECT COUNT(*) FROM players WHERE team_id=t.id) as count FROM teams t WHERE t.tournament_id=1 ORDER BY t.id`).all();
  return c.json({ teams: results });
});

adminApi.post('/api/admin/teams', async (c) => {
  const { id, name, short_name } = await c.req.json<{ id?: number; name: string; short_name: string }>();
  if (!id) await c.env.DB.prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1,?,?)').bind(name, short_name).run();
  else await c.env.DB.prepare('UPDATE teams SET name=?, short_name=? WHERE id=?').bind(name, short_name, id).run();
  return c.json({ success: true });
});

adminApi.delete('/api/admin/teams', async (c) => {
  await c.env.DB.prepare('DELETE FROM teams WHERE id=?').bind(c.req.query('id')).run();
  return c.json({ success: true });
});

// /api/admin/tournament
adminApi.get('/api/admin/tournament', async (c) => {
  const t = await c.env.DB.prepare("SELECT COALESCE(info,'') as info, COALESCE(venue,'') as venue, COALESCE(start_date,'') as start_date, COALESCE(tables_count,8) as tables FROM tournaments WHERE id=1").first();
  return c.json(t || {});
});

adminApi.post('/api/admin/tournament', async (c) => {
  const { info, venue, start_date } = await c.req.json<{ info: string; venue: string; start_date: string }>();
  await c.env.DB.prepare('UPDATE tournaments SET info=?, venue=?, start_date=? WHERE id=1').bind(info, venue, start_date).run();
  return c.json({ success: true });
});

// /api/admin/events
adminApi.get('/api/admin/events', async (c) => {
  const id = c.req.query('id');
  if (id) {
    const e = await c.env.DB.prepare("SELECT id, title, event_type as type, COALESCE(stage,'loop') as stage, groups, best_of FROM events WHERE id=?").bind(id).first();
    return c.json({ event: e });
  }
  const { results } = await c.env.DB.prepare("SELECT id, title, event_type as type, COALESCE(stage,'loop') as stage, groups, best_of FROM events WHERE tournament_id=1").all();
  return c.json({ events: results });
});

adminApi.post('/api/admin/events', async (c) => {
  const { id, title, type, stage: stg, groups, best_of } = await c.req.json<{ id?: number; title: string; type: string; stage?: string; groups: number; best_of: number }>();
  const stage = stg || 'loop';
  const db = c.env.DB;
  if (!id) {
    const key = `${type}${Date.now() % 10000}`;
    const r = await db.prepare('INSERT INTO events (tournament_id, key, event_type, title, stage, groups, best_of) VALUES (1,?,?,?,?,?,?)').bind(key, type, title, stage, groups, best_of).run();
    if (stage === 'loop') {
      for (let i = 1; i <= groups; i++) await db.prepare('INSERT INTO group_tables (event_id, group_name, group_index) VALUES (?,?,?)').bind(r.meta.last_row_id, `${i} 组`, i).run();
    }
  } else {
    await db.prepare('UPDATE events SET title=?, event_type=?, stage=?, groups=?, best_of=? WHERE id=?').bind(title, type, stage, groups, best_of, id).run();
  }
  return c.json({ success: true });
});

adminApi.delete('/api/admin/events', async (c) => {
  const id = c.req.query('id');
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM matches WHERE event_id=?').bind(id),
    c.env.DB.prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id=?)').bind(id),
    c.env.DB.prepare('DELETE FROM group_tables WHERE event_id=?').bind(id),
    c.env.DB.prepare('DELETE FROM events WHERE id=?').bind(id),
  ]);
  return c.json({ success: true });
});

// Draw APIs
adminApi.post('/api/admin/draw/assign', async (c) => {
  const { event_id, player_id, group_index } = await c.req.json<{ event_id: number; player_id: number; group_index: number }>();
  const db = c.env.DB;
  const g = await db.prepare('SELECT id FROM group_tables WHERE event_id=? AND group_index=?').bind(event_id, group_index).first();
  const mp = await db.prepare('SELECT COALESCE(MAX(position),0) as p FROM group_entries WHERE group_id=?').bind(g!.id).first();
  await db.prepare('INSERT INTO group_entries (group_id, player_id, position) VALUES (?,?,?)').bind(g!.id, player_id, (mp!.p as number) + 1).run();
  return c.json({ success: true });
});

adminApi.post('/api/admin/draw/remove', async (c) => {
  const { group_id, player_id } = await c.req.json<{ group_id: number; player_id: number }>();
  await c.env.DB.prepare('DELETE FROM group_entries WHERE group_id=? AND player_id=?').bind(group_id, player_id).run();
  return c.json({ success: true });
});

adminApi.post('/api/admin/draw/clear', async (c) => {
  const { event_id } = await c.req.json<{ event_id: number }>();
  await c.env.DB.prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id=?)').bind(event_id).run();
  return c.json({ success: true });
});

adminApi.post('/api/admin/draw/auto', async (c) => {
  const { event_id } = await c.req.json<{ event_id: number }>();
  const db = c.env.DB;
  await db.prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id=?)').bind(event_id).run();
  const { results: gs } = await db.prepare('SELECT id FROM group_tables WHERE event_id=? ORDER BY group_index').bind(event_id).all();
  const { results: ps } = await db.prepare('SELECT id FROM players WHERE tournament_id=1 ORDER BY RANDOM()').all();
  for (let i = 0; i < ps.length; i++) {
    const gid = gs[i % gs.length].id;
    const mp = await db.prepare('SELECT COALESCE(MAX(position),0)+1 as p FROM group_entries WHERE group_id=?').bind(gid).first();
    await db.prepare('INSERT INTO group_entries (group_id, player_id, position) VALUES (?,?,?)').bind(gid, ps[i].id, mp!.p).run();
  }
  return c.json({ success: true });
});

adminApi.post('/api/admin/draw/matches', async (c) => {
  const { event_id } = await c.req.json<{ event_id: number }>();
  const db = c.env.DB;
  await db.prepare('DELETE FROM matches WHERE event_id=?').bind(event_id).run();
  const stg = await db.prepare("SELECT COALESCE(stage,'loop') as s FROM events WHERE id=?").bind(event_id).first();
  let matchOrder = 90001, count = 0;
  if (stg?.s === 'knockout') {
    const { results: ps } = await db.prepare(`SELECT ge.player_id FROM group_entries ge
      JOIN group_tables gt ON ge.group_id=gt.id WHERE gt.event_id=? ORDER BY ge.position`).bind(event_id).all();
    const n = ps.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      await db.prepare("INSERT INTO matches (event_id, round, match_order, player1_id, player2_id, status, table_no, time) VALUES (?,1,?,?,?,'scheduled',?,'')")
        .bind(event_id, matchOrder, ps[i * 2]?.player_id || 0, ps[i * 2 + 1]?.player_id || 0, (count % 8) + 1).run();
      matchOrder++; count++;
    }
  } else {
    const { results: gs } = await db.prepare('SELECT id FROM group_tables WHERE event_id=?').bind(event_id).all();
    for (const g of gs) {
      const { results: ps } = await db.prepare('SELECT player_id FROM group_entries WHERE group_id=? ORDER BY position').bind(g.id).all();
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          await db.prepare("INSERT INTO matches (event_id, group_id, match_order, player1_id, player2_id, player3_id, player4_id, status, table_no, time) VALUES (?,?,?,?,?,?,?,'scheduled',?,'')")
            .bind(event_id, g.id, matchOrder, ps[i].player_id, null, ps[j].player_id, null, (count % 8) + 1).run();
          matchOrder++; count++;
        }
      }
    }
  }
  return c.json({ success: true, count });
});

// /api/admin/notice
adminApi.get('/api/admin/notice', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, COALESCE(title,'') as title, content, created_at FROM notices ORDER BY created_at DESC").all();
  return c.json({ notices: results });
});

adminApi.post('/api/admin/notice', async (c) => {
  const { id, title, content } = await c.req.json<{ id?: number; title: string; content: string }>();
  if (!id) await c.env.DB.prepare("INSERT INTO notices (tournament_id, title, content, created_at) VALUES (1,?,?,datetime('now'))").bind(title, content).run();
  else await c.env.DB.prepare('UPDATE notices SET title=?, content=? WHERE id=?').bind(title, content, id).run();
  return c.json({ success: true });
});

adminApi.delete('/api/admin/notice', async (c) => {
  const { id } = await c.req.json<{ id: number }>();
  await c.env.DB.prepare('DELETE FROM notices WHERE id=?').bind(id).run();
  return c.json({ success: true });
});

// /api/admin/backup - export all data as JSON
adminApi.get('/api/admin/backup', async (c) => {
  const tables = ['tournaments', 'events', 'teams', 'players', 'group_tables', 'group_entries', 'matches', 'scores', 'notices', 'brackets', 'draws', 'referees', 'leaders', 'ratings', 'settings'];
  const data: Record<string, unknown[]> = {};
  for (const t of tables) { try { data[t] = (await c.env.DB.prepare(`SELECT * FROM ${t}`).all()).results; } catch { data[t] = []; } }
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename=paddlepal-backup-${Date.now()}.json` },
  });
});
