import { Hono } from 'hono';
import { HomePage } from '../views/home';
import { LivePage } from '../views/live';
import { PlayersPage } from '../views/players';
import { SchedulePage } from '../views/schedule';
import { ResultsListPage, ResultsDetailPage } from '../views/results';
import { AdminPage } from '../views/admin';
import { ScorePage, ScoreNotFound } from '../views/score';
import { TournamentEditPage, EventsEditPage } from '../views/admin-edit';
import { TeamsEditPage, PlayersEditPage, NoticesEditPage } from '../views/admin-crud';
import { DrawPage } from '../views/draw';
import { SearchPage } from '../views/search';
import { BracketPage } from '../views/bracket';
import { TeamMatchPage } from '../views/team-match';

type Bindings = { DB: D1Database };
export const pages = new Hono<{ Bindings: Bindings }>();

// Home
pages.get('/', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare("SELECT COALESCE(info,'') as info, COALESCE(venue,'') as addr, COALESCE(start_date,'') as date, COALESCE(tables_count,8) as tables, COALESCE(days,1) as days FROM tournaments WHERE id=1").first();
  const { results: events } = await db.prepare(`
    SELECT e.key, e.event_type as event, e.title,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id) as plays,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id AND status='finished') as finish
    FROM events e WHERE e.tournament_id=1 ORDER BY e.id
  `).all();
  const evs = events.map(e => {
    const plays = e.plays as number, finish = e.finish as number;
    return { ...e, plays, finish, progress: plays > 0 ? `${Math.floor(finish * 100 / plays)}%` : '0%', beg_time: '', end_time: '' } as any;
  });
  return c.html(<HomePage info={t?.info as string || ''} addr={t?.addr as string || ''} date={t?.date as string || ''} tables={t?.tables as number || 8} days={t?.days as number || 1} events={evs} />);
});

// Live
pages.get('/live', async (c) => {
  const db = c.env.DB;
  const { results: playingRows } = await db.prepare(`
    SELECT m.id, m.table_no as tb, m.time as tm, e.key as gp, e.event_type as ev,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr, m.result
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='playing' ORDER BY m.table_no
  `).all();
  const playing = [];
  for (const r of playingRows) {
    const { results: sRows } = await db.prepare('SELECT score_left as l, score_right as r FROM scores WHERE match_id=? ORDER BY game_no').bind(r.id).all();
    playing.push({ ...r, score: sRows } as any);
  }
  const { results: upcoming } = await db.prepare(`
    SELECT m.id, m.table_no as tb, m.time as tm, e.key as gp,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.status='scheduled' ORDER BY m.time, m.table_no LIMIT 10
  `).all();
  return c.html(<LivePage playing={playing as any} upcoming={upcoming as any} />);
});

// Players
pages.get('/players', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.id, p.name, p.gender, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY t.id, p.name
  `).all();
  return c.html(<PlayersPage members={results as any} />);
});

// Schedule
pages.get('/schedule', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare("SELECT COALESCE(info,'') as info FROM tournaments WHERE id=1").first();
  const { results } = await db.prepare(`
    SELECT m.match_order as pid, m.time, m.table_no, m.date, m.status, m.result,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    ORDER BY m.date, m.time, m.table_no, m.match_order
  `).all();
  return c.html(<SchedulePage matches={results as any} info={t?.info as string || ''} />);
});

// Results list
pages.get('/results', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare("SELECT COALESCE(info,'') as info FROM tournaments WHERE id=1").first();
  const { results: events } = await db.prepare(`
    SELECT e.key, e.title, e.event_type as type, COALESCE(e.stage,'loop') as stage,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id) as plays,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id AND status='finished') as finish
    FROM events e WHERE e.tournament_id=1 ORDER BY e.id
  `).all();
  return c.html(<ResultsListPage events={events as any} info={t?.info as string || ''} />);
});

// Results detail
pages.get('/results/:key', async (c) => {
  const db = c.env.DB;
  const key = c.req.param('key');
  const ev = await db.prepare("SELECT id, title, event_type, COALESCE(stage,'loop') as stage, groups FROM events WHERE key=?").bind(key).first();
  if (!ev) return c.text('Not found', 404);

  // Rankings
  const { results: gRows } = await db.prepare('SELECT id, group_name FROM group_tables WHERE event_id=? ORDER BY group_index').bind(ev.id).all();
  const ranks = [];
  const crosses = [];

  for (const g of gRows) {
    // Rank data
    const { results: rRows } = await db.prepare(`
      SELECT ge.rank, COALESCE(p.name,'') as name, COALESCE(t.short_name,'') as team
      FROM group_entries ge LEFT JOIN players p ON ge.player_id=p.id
      LEFT JOIN teams t ON COALESCE(ge.team_id, p.team_id)=t.id
      WHERE ge.group_id=? ORDER BY ge.rank, ge.position
    `).bind(g.id).all();
    if (rRows.length > 0) {
      ranks.push({ group: g.group_name as string, rows: rRows.map(r => [r.rank, r.name, r.team]) });
    }

    // Cross table
    const { results: entries } = await db.prepare(`
      SELECT ge.player_id, ge.position, ge.rank, COALESCE(p.name,'') as name, COALESCE(t.short_name,'') as team
      FROM group_entries ge LEFT JOIN players p ON ge.player_id=p.id
      LEFT JOIN teams t ON COALESCE(ge.team_id, p.team_id)=t.id
      WHERE ge.group_id=? ORDER BY ge.position
    `).bind(g.id).all();

    if (entries.length < 2) continue;

    const n = entries.length;
    const header = [];
    for (let i = 1; i <= n; i++) header.push(`${i}`);

    const rows = [];
    for (let i = 0; i < n; i++) {
      const e = entries[i];
      const pid = e.player_id as number;
      const cells: string[] = [];
      let points = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) { cells.push(''); continue; }
        const opp = entries[j];
        const oppPid = opp.player_id as number;

        const m = await db.prepare(`
          SELECT m.id, m.result, m.player1_id FROM matches m
          WHERE m.group_id=? AND ((m.player1_id=? AND m.player3_id=?) OR (m.player1_id=? AND m.player3_id=?))
        `).bind(g.id, pid, oppPid, oppPid, pid).first();

        if (!m) { cells.push(''); continue; }

        const isLeft = (m.player1_id as number) === pid;
        const result = (m.result as string) || '';
        const { results: sRows } = await db.prepare('SELECT score_left, score_right FROM scores WHERE match_id=? ORDER BY game_no').bind(m.id).all();

        let wl = 0, wr = 0;
        for (const s of sRows) {
          const sl = s.score_left as number, sr = s.score_right as number;
          if (sl > sr) wl++; else if (sr > sl) wr++;
        }
        const myWin = isLeft ? wl : wr;
        const oppWin = isLeft ? wr : wl;
        const won = myWin > oppWin;
        if (won) points += 2;
        else if (result && result !== '双弃权') points += 1;

        const myResult = !isLeft && result.includes(':') ? result.split(':').reverse().join(':') : result;
        const color = won ? 'text-red-600 font-bold' : 'text-gray-500';
        cells.push(`<span class="${color}">${myResult}</span>`);
      }

      rows.push({
        player: [e.position as number, e.name as string, e.team as string] as [number, string, string],
        cells, points, rank: e.rank as number,
      });
    }

    crosses.push({ name: g.group_name as string, header, rows });
  }

  return c.html(<ResultsDetailPage title={ev.title as string} stage={ev.stage as string} ranks={ranks as any} crosses={crosses} />);
});

// Admin
pages.get('/admin', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare("SELECT COALESCE(info,'') as info, COALESCE(venue,'') as venue FROM tournaments WHERE id=1").first();
  const { results: teams } = await db.prepare(`SELECT t.id, t.name, COALESCE(t.short_name,'') as short_name,
    (SELECT COUNT(*) FROM players WHERE team_id=t.id) as count FROM teams t WHERE t.tournament_id=1 ORDER BY t.id`).all();
  const { results: players } = await db.prepare(`SELECT p.id, p.name, p.gender, p.rating, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY p.rating DESC`).all();
  const { results: events } = await db.prepare("SELECT id, title, event_type as type, COALESCE(stage,'loop') as stage, groups, COALESCE(best_of,3) as best_of FROM events WHERE tournament_id=1").all();
  const { results: matches } = await db.prepare(`
    SELECT m.match_order as pid, m.time, m.status, m.result, m.table_no as 'table',
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    ORDER BY m.match_order DESC
  `).all();
  return c.html(<AdminPage info={t?.info as string || ''} venue={t?.venue as string || ''} teams={teams as any} players={players as any} events={events as any} matches={matches as any} />);
});

// Score entry
pages.get('/score/:pid', async (c) => {
  const db = c.env.DB;
  const pid = c.req.param('pid');
  const r = await db.prepare(`
    SELECT m.id, m.match_order as pid, m.table_no, m.time, m.status, m.result, m.seat1, m.seat2,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2,
      COALESCE(t1.short_name,'') as t1, COALESCE(t2.short_name,'') as t2,
      e.title, COALESCE(e.best_of,3) as best_of
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.match_order=?
  `).bind(pid).first();
  if (!r) return c.html(<ScoreNotFound pid={pid} />);

  const { results: sRows } = await db.prepare('SELECT score_left as l, score_right as r FROM scores WHERE match_id=? ORDER BY game_no').bind(r.id).all();
  return c.html(<ScorePage match={{ ...r, scores: sRows } as any} />);
});

// Admin sub-pages
pages.get('/admin/tournament', async (c) => {
  const t = await c.env.DB.prepare("SELECT COALESCE(info,'') as info, COALESCE(venue,'') as venue, COALESCE(start_date,'') as start_date, COALESCE(tables_count,8) as tables FROM tournaments WHERE id=1").first();
  return c.html(<TournamentEditPage info={t?.info as string || ''} venue={t?.venue as string || ''} start_date={t?.start_date as string || ''} tables={t?.tables as number || 8} />);
});

pages.get('/admin/events', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, title, event_type as type, COALESCE(stage,'loop') as stage, groups, COALESCE(best_of,3) as best_of FROM events WHERE tournament_id=1").all();
  return c.html(<EventsEditPage events={results as any} />);
});

pages.get('/admin/teams', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT t.id, t.name, COALESCE(t.short_name,'') as short_name,
    (SELECT COUNT(*) FROM players WHERE team_id=t.id) as count FROM teams t WHERE t.tournament_id=1 ORDER BY t.id`).all();
  return c.html(<TeamsEditPage teams={results as any} />);
});

pages.get('/admin/players', async (c) => {
  const db = c.env.DB;
  const { results: players } = await db.prepare(`SELECT p.id, p.name, p.gender, p.rating, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY p.id`).all();
  const { results: teams } = await db.prepare('SELECT id, name FROM teams WHERE tournament_id=1 ORDER BY id').all();
  return c.html(<PlayersEditPage players={players as any} teams={teams as any} />);
});

pages.get('/admin/notices', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, COALESCE(title,'') as title, content, created_at FROM notices ORDER BY created_at DESC").all();
  return c.html(<NoticesEditPage notices={results as any} />);
});

// Draw page
pages.get('/admin/draw/:eventId', async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param('eventId');
  const ev = await db.prepare("SELECT id, title, COALESCE(stage,'loop') as stage FROM events WHERE id=?").bind(eventId).first();
  if (!ev) return c.text('Not found', 404);

  const { results: gRows } = await db.prepare('SELECT id, group_name as name FROM group_tables WHERE event_id=? ORDER BY group_index').bind(eventId).all();
  const assignedIds: number[] = [];
  const groups = [];
  for (const g of gRows) {
    const { results: pRows } = await db.prepare(`SELECT ge.player_id as id, ge.position, p.name
      FROM group_entries ge JOIN players p ON ge.player_id=p.id WHERE ge.group_id=? ORDER BY ge.position`).bind(g.id).all();
    pRows.forEach(p => assignedIds.push(p.id as number));
    groups.push({ id: g.id, name: g.name, players: pRows });
  }
  const { results: allPlayers } = await db.prepare(`SELECT p.id, p.name, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY p.name`).all();
  const unassigned = allPlayers.filter(p => !assignedIds.includes(p.id as number));

  return c.html(<DrawPage event={ev as any} groups={groups as any} unassigned={unassigned as any} />);
});

// Search
pages.get('/search', async (c) => {
  const q = (c.req.query('q') || '').trim();
  if (!q) return c.html(<SearchPage q="" matches={[]} />);
  const { results } = await c.env.DB.prepare(`
    SELECT m.match_order as pid, m.time, m.table_no, m.status, m.result,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE p1.name LIKE ?1 OR p2.name LIKE ?1
    ORDER BY m.time, m.match_order
  `).bind(`%${q}%`).all();
  return c.html(<SearchPage q={q} matches={results as any} />);
});

// Bracket view (knockout events)
pages.get('/bracket/:eventId', async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param('eventId');
  const ev = await db.prepare('SELECT title FROM events WHERE id=?').bind(eventId).first();
  if (!ev) return c.text('Not found', 404);
  const { results } = await db.prepare(`
    SELECT m.id, COALESCE(m.round,1) as round, m.match_order as position, m.status, m.result, COALESCE(m.winner_side,0) as winner,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.event_id=? ORDER BY m.round, m.match_order
  `).bind(eventId).all();
  const maxRound = results.reduce((mx, r) => Math.max(mx, r.round as number), 1);
  const rounds: any[][] = [];
  for (let r = 1; r <= maxRound; r++) rounds.push(results.filter(m => m.round === r));
  return c.html(<BracketPage title={ev.title as string} rounds={rounds} maxRound={maxRound} />);
});

// Team match view
pages.get('/team/:eventId', async (c) => {
  const db = c.env.DB;
  const eventId = c.req.param('eventId');
  const ev = await db.prepare('SELECT title FROM events WHERE id=?').bind(eventId).first();
  if (!ev) return c.text('Not found', 404);
  // Team matches: matches with team1_id set
  const { results: tms } = await db.prepare(`
    SELECT m.id, m.match_order, m.time, m.table_no, m.status, m.result,
      COALESCE(t1.name,'') as team1, COALESCE(t2.name,'') as team2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.event_id=? AND m.team1_id IS NOT NULL ORDER BY m.match_order
  `).bind(eventId).all();
  // For each team match, find rubber matches (individual matches in same group/round)
  const matches = [];
  for (const tm of tms) {
    const { results: rubbers } = await db.prepare(`
      SELECT m.match_order as pid, COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, m.result, m.status
      FROM matches m
      LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
      WHERE m.event_id=? AND m.group_id=? AND m.team1_id IS NULL ORDER BY m.match_order
    `).bind(eventId, tm.id).all();
    matches.push({ ...tm, rubbers: rubbers.length > 0 ? rubbers : [] });
  }
  return c.html(<TeamMatchPage event={ev.title as string} matches={matches as any} />);
});
