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
import { BigScreenLive, BigScreenResults, BigScreenSchedule } from '../views/bigscreen';
import { RankingPage, NoticesPage, ProgressPage } from '../views/extra';
import { BigScreenFlags, FlagUploadPage } from '../views/flags';
import { DrawListPage } from '../views/draw-list';
import { ExportPage } from '../views/export';
import { DrawBoardPage } from '../views/draw-board';
import type { HomeEvent, LiveMatch, UpcomingMatch, PlayerMember, ScheduleMatch, ResultEvent } from '../types';

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
  const evs: HomeEvent[] = events.map(e => {
    const plays = e.plays as number, finish = e.finish as number;
    return { key: e.key as string, event: e.event as string, title: e.title as string, plays, finish, progress: plays > 0 ? `${Math.floor(finish * 100 / plays)}%` : '0%', beg_time: '', end_time: '' };
  });
  return c.html(<HomePage info={t?.info as string || ''} addr={t?.addr as string || ''} date={t?.date as string || ''} tables={t?.tables as number || 8} days={t?.days as number || 1} events={evs} />);
});

// Live
pages.get('/live', async (c) => {
  const db = c.env.DB;
  const { results: playingRows } = await db.prepare(`
    SELECT m.id, m.match_order as pid, m.table_no as tb, m.time as tm, e.key as gp, e.event_type as ev,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr, m.result
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='playing' ORDER BY m.table_no
  `).all();
  const playing: LiveMatch[] = [];
  for (const r of playingRows) {
    const { results: sRows } = await db.prepare('SELECT score_left as l, score_right as r FROM scores WHERE match_id=? ORDER BY game_no').bind(r.id).all();
    playing.push({
      id: r.id as number, pid: r.pid as number, tb: r.tb as number, tm: r.tm as string,
      gp: r.gp as string, ev: r.ev as string, nl: r.nl as string, nr: r.nr as string,
      tnl: r.tnl as string, tnr: r.tnr as string, result: r.result as string,
      score: sRows.map(s => ({ l: s.l as number, r: s.r as number }))
    });
  }
  const { results: upcomingRows } = await db.prepare(`
    SELECT m.id, m.match_order as pid, m.table_no as tb, m.time as tm, e.key as gp,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.status='scheduled' ORDER BY m.time, m.table_no LIMIT 10
  `).all();
  const upcoming: UpcomingMatch[] = upcomingRows.map(r => ({
    id: r.id as number, pid: r.pid as number, tb: r.tb as number, tm: r.tm as string,
    gp: r.gp as string, nl: r.nl as string, nr: r.nr as string
  }));
  return c.html(<LivePage playing={playing} upcoming={upcoming} />);
});

// Players
pages.get('/players', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.id, p.name, p.gender, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY t.id, p.name
  `).all();
  const members: PlayerMember[] = results.map(r => ({
    id: r.id as number, name: r.name as string, gender: r.gender as string, team: r.team as string
  }));
  return c.html(<PlayersPage members={members} />);
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
  const matches: ScheduleMatch[] = results.map(r => ({
    pid: r.pid as number, time: r.time as string, table_no: r.table_no as number,
    date: r.date as string, status: r.status as string, result: r.result as string,
    player1: r.player1 as string, player2: r.player2 as string, event: r.event as string
  }));
  return c.html(<SchedulePage matches={matches} info={t?.info as string || ''} />);
});

// Results list
pages.get('/results', async (c) => {
  const db = c.env.DB;
  const t = await db.prepare("SELECT COALESCE(info,'') as info FROM tournaments WHERE id=1").first();
  const { results: eventRows } = await db.prepare(`
    SELECT e.key, e.title, e.event_type as type, COALESCE(e.stage,'loop') as stage,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id) as plays,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id AND status='finished') as finish
    FROM events e WHERE e.tournament_id=1 ORDER BY e.id
  `).all();
  const events: ResultEvent[] = eventRows.map(r => ({
    key: r.key as string, title: r.title as string, type: r.type as string,
    stage: r.stage as string, plays: r.plays as number, finish: r.finish as number
  }));
  return c.html(<ResultsListPage events={events} info={t?.info as string || ''} />);
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

// Draw list page - select event to draw
pages.get('/admin/draw', async (c) => {
  const db = c.env.DB;
  const { results: events } = await db.prepare(`
    SELECT e.id, e.key, e.title, 
      COALESCE(e.event_type, 'singles') as type,
      COALESCE(e.stage, 'knockout') as format,
      (SELECT COUNT(*) FROM matches WHERE event_id = e.id) as match_count
    FROM events e WHERE e.tournament_id = 1 ORDER BY e.id
  `).all();
  
  return c.html(<DrawListPage events={events as any} />);
});

// Draw page for specific event
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

// Big Screen: Live scores (dual panel)
pages.get('/screen/live', async (c) => {
  const db = c.env.DB;
  const { results: playing } = await db.prepare(`
    SELECT m.table_no as tb, e.key as gp, COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr, m.result as score
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='playing' ORDER BY m.table_no
  `).all();
  const { results: checkin } = await db.prepare(`
    SELECT m.table_no as tb, e.key as gp, COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='checkin' ORDER BY m.table_no
  `).all();
  return c.html(<BigScreenLive matches={playing as any} checkin={checkin as any} />);
});

// Big Screen: Results
pages.get('/screen/results/:eventKey?', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.param('eventKey');
  let results, title = '最新成绩';
  if (eventKey) {
    const ev = await db.prepare('SELECT id, title FROM events WHERE key=?').bind(eventKey).first();
    if (ev) {
      title = ev.title as string;
      const { results: r } = await db.prepare(`
        SELECT m.round, m.match_order as 'order', m.table_no as tb, m.result, m.winner_side as winner,
          COALESCE(p1.name, t1.short_name, '') as p1, COALESCE(p2.name, t2.short_name, '') as p2
        FROM matches m
        LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
        LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
        WHERE m.event_id=? AND m.status='finished' ORDER BY m.id DESC LIMIT 20
      `).bind(ev.id).all();
      results = r;
    }
  }
  if (!results) {
    const { results: r } = await db.prepare(`
      SELECT m.round, m.match_order as 'order', m.table_no as tb, m.result, m.winner_side as winner,
        COALESCE(p1.name, t1.short_name, '') as p1, COALESCE(p2.name, t2.short_name, '') as p2
      FROM matches m
      LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
      LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
      WHERE m.status='finished' ORDER BY m.id DESC LIMIT 20
    `).all();
    results = r;
  }
  return c.html(<BigScreenResults event={title} results={results as any} />);
});

// Big Screen: Schedule
pages.get('/screen/schedule/:eventKey?', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.param('eventKey');
  let matches, title = '比赛秩序';
  if (eventKey) {
    const ev = await db.prepare('SELECT id, title FROM events WHERE key=?').bind(eventKey).first();
    if (ev) {
      title = ev.title as string;
      const { results } = await db.prepare(`
        SELECT m.time, m.table_no as tb, e.key as event, m.status,
          COALESCE(p1.name, t1.short_name, '') as p1, COALESCE(p2.name, t2.short_name, '') as p2
        FROM matches m JOIN events e ON m.event_id=e.id
        LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
        LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
        WHERE m.event_id=? ORDER BY m.time, m.table_no LIMIT 30
      `).bind(ev.id).all();
      matches = results;
    }
  }
  if (!matches) {
    const { results } = await db.prepare(`
      SELECT m.time, m.table_no as tb, e.key as event, m.status,
        COALESCE(p1.name, t1.short_name, '') as p1, COALESCE(p2.name, t2.short_name, '') as p2
      FROM matches m JOIN events e ON m.event_id=e.id
      LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
      LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
      WHERE m.status IN ('scheduled','playing','checkin') ORDER BY m.time, m.table_no LIMIT 30
    `).all();
    matches = results;
  }
  return c.html(<BigScreenSchedule title={title} matches={matches as any} />);
});


// Ranking page
pages.get('/ranking', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT p.id, p.name, p.rating, t.short_name as team
    FROM players p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.tournament_id = 1 AND p.rating > 0
    ORDER BY p.rating DESC LIMIT 100
  `).all();
  return c.html(<RankingPage players={results as any} />);
});

// Notices page
pages.get('/notices', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT title, content, created_at FROM notices
    WHERE tournament_id = 1 ORDER BY id DESC
  `).all();
  return c.html(<NoticesPage notices={results as any} />);
});

// Progress page
pages.get('/progress', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT e.key, e.title,
      (SELECT COUNT(*) FROM matches WHERE event_id = e.id) as total,
      (SELECT COUNT(*) FROM matches WHERE event_id = e.id AND status = 'finished') as finished
    FROM events e WHERE e.tournament_id = 1 ORDER BY e.id
  `).all();
  return c.html(<ProgressPage events={results as any} />);
});


// Big Screen: Live with flags
pages.get('/screen/flags', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT m.table_no as tb, e.key as event, m.result as score,
      COALESCE(p1.name, t1.short_name, '') as p1,
      COALESCE(p2.name, t2.short_name, '') as p2,
      t1.flag as flag1, t2.flag as flag2
    FROM matches m JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON COALESCE(m.team1_id, p1.team_id) = t1.id
    LEFT JOIN teams t2 ON COALESCE(m.team2_id, p2.team_id) = t2.id
    WHERE m.status = 'playing' ORDER BY m.table_no
  `).all();
  return c.html(<BigScreenFlags matches={results as any} />);
});

// Flag upload management page
pages.get('/admin/flags', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT id, name, flag FROM teams WHERE tournament_id = 1 ORDER BY name
  `).all();
  return c.html(<FlagUploadPage teams={results as any} />);
});

// Export center page
pages.get('/admin/export', async (c) => {
  const db = c.env.DB;
  const { results: events } = await db.prepare('SELECT key, title FROM events WHERE tournament_id = 1 ORDER BY id').all();
  const tournament = await db.prepare("SELECT COALESCE(info,'') as name, COALESCE(venue,'') as venue, COALESCE(start_date,'') as date FROM tournaments WHERE id = 1").first();
  return c.html(<ExportPage events={events as any} tournament={tournament as any} />);
});

// Draw board (projection display)
pages.get('/screen/draw/:eventKey', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.param('eventKey');
  const event = await db.prepare('SELECT id, key, title FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.text('Event not found', 404);

  const { results: entries } = await db.prepare(`
    SELECT d.position, d.seed, p.name as player, COALESCE(t.short_name,'') as team, p.rating, d.draw_time
    FROM draws d
    JOIN players p ON d.player_id = p.id
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE d.event_id = ?
    ORDER BY d.position
  `).bind(event.id).all();

  const total = await db.prepare(`
    SELECT COUNT(*) as cnt FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id = ?)
  `).bind(event.id).first();
  const totalPlayers = (total?.cnt as number) || 16;
  const status = entries.length === 0 ? 'pending' : entries.length >= totalPlayers ? 'completed' : 'drawing';

  const tournament = await db.prepare("SELECT COALESCE(info,'') as name FROM tournaments WHERE id = 1").first();

  return c.html(<DrawBoardPage 
    event={{ key: eventKey, title: event.title as string, entries: entries as any, status: status as any, totalPlayers }}
    tournament={tournament?.name as string || ''}
  />);
});

// Live API for polling
pages.get('/api/live', async (c) => {
  const db = c.env.DB;
  const { results: playingRows } = await db.prepare(`
    SELECT m.id, m.match_order as pid, m.table_no as tb, m.time as tm, e.key as gp, e.event_type as ev,
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
    playing.push({ ...r, score: sRows });
  }
  
  return c.json({ playing });
});
