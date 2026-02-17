import { Hono } from 'hono';

type Bindings = { DB: D1Database };
export const publicApi = new Hono<{ Bindings: Bindings }>();

async function getScores(db: D1Database, matchId: number) {
  const { results } = await db.prepare('SELECT score_left as l, score_right as r FROM scores WHERE match_id=? ORDER BY game_no').bind(matchId).all();
  return results;
}

// GET /rawinfo
publicApi.get('/rawinfo', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare("SELECT COALESCE(info,'') as info, COALESCE(venue,'') as addr, COALESCE(start_date,'') as date, COALESCE(tables_count,8) as tables, COALESCE(days,1) as days FROM tournaments WHERE id=1").first();
  const { results: events } = await db.prepare(`
    SELECT e.key, e.event_type as event, e.title, e.groups,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id) as plays,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id AND status='finished') as finish,
      (SELECT MIN(time) FROM matches WHERE event_id=e.id) as beg_time,
      (SELECT MAX(time) FROM matches WHERE event_id=e.id) as end_time
    FROM events e WHERE e.tournament_id=1 ORDER BY e.id
  `).all();
  const match = events.map(e => {
    const plays = e.plays as number, finish = e.finish as number;
    return {
      key: e.key, group: '', event: e.event, stage: 1, extra: 1, title: e.title,
      all: plays, in: 0, begrank: 1, groups: e.groups, plays, edits: finish,
      unedits: plays - finish, names: plays, records: finish, finish,
      beg_time: e.beg_time ?? '', end_time: e.end_time ?? '',
      progress: plays > 0 ? `${Math.floor(finish * 100 / plays)}%` : '0%',
    };
  });
  return c.json({ info: t?.info ?? '', addr: t?.addr ?? '', tables: t?.tables ?? 8, date: t?.date ?? '', days: t?.days ?? 1, match });
});

// GET /playing
publicApi.get('/playing', async (c) => {
  const db = c.env.DB;
  const { results: rows } = await db.prepare(`
    SELECT m.id, m.table_no as tb, m.time as tm, e.key as gp, e.event_type as ev,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.flag,'') as tl, COALESCE(t2.flag,'') as tr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr, m.result
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='playing' ORDER BY m.table_no
  `).all();
  const arr = [];
  for (const r of rows) {
    const scores = await getScores(db, r.id as number);
    arr.push({ ...r, score: scores });
  }
  return c.json({ array: arr });
});

// GET /toplay
publicApi.get('/toplay', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT m.id, m.table_no as tb, m.time as tm, e.key as gp, e.event_type as ev,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.flag,'') as tl, COALESCE(t2.flag,'') as tr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='scheduled' ORDER BY m.time, m.table_no LIMIT 20
  `).all();
  return c.json({ array: results });
});

// GET /notice
publicApi.get('/notice', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, COALESCE(title,'') as title, content, created_at as time FROM notices ORDER BY created_at DESC").all();
  return c.json({ notices: results });
});

// GET /member
publicApi.get('/member', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.id, p.name, p.gender, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY t.id, p.name
  `).all();
  return c.json({ members: results });
});

// POST routes for legacy frontend compat
publicApi.post('/oneplay', async (c) => {
  const body = await c.req.parseBody();
  const pid = body['pid'] as string;
  const r = await c.env.DB.prepare(`
    SELECT m.id, e.key, e.event_type, e.title, e.groups,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2,
      COALESCE(p3.name,'') as p3, COALESCE(p4.name,'') as p4,
      COALESCE(t1.short_name,'') as t1, COALESCE(t2.short_name,'') as t2,
      COALESCE(t3.short_name,'') as t3, COALESCE(t4.short_name,'') as t4,
      m.date, m.time, m.table_no, m.result, m.seat1, m.seat2
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN players p3 ON m.player3_id=p3.id LEFT JOIN players p4 ON m.player4_id=p4.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    LEFT JOIN teams t3 ON m.team3_id=t3.id LEFT JOIN teams t4 ON m.team4_id=t4.id
    WHERE m.match_order=?
  `).bind(pid).first();
  if (!r) return c.json({});
  const scores = await getScores(c.env.DB, r.id as number);
  return c.json({
    name: r.key, group: '', event: r.event_type, stage: 1, extra: 1, title: r.title, groupcnt: r.groups,
    play: {
      pid, date: r.date, time: r.time, table: `${r.table_no}台`, seat1: r.seat1, seat2: r.seat2,
      player1: r.p1, player2: r.p2, player3: r.p3, player4: r.p4,
      team1: r.t1, team2: r.t2, team3: r.t3, team4: r.t4,
      result: r.result, score: scores.map(s => [s.l, s.r]),
    },
  });
});
