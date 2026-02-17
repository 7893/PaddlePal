import { Env } from '../types';
import { json, getParam, getFormData } from '../utils';

export async function handleAdminRoute(path: string, request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const db = env.DB;

  // Match save/status/walkover
  if (path === '/api/admin/match/save') return matchSave(request, db);
  if (path === '/api/admin/match/status') return matchStatus(request, db);
  if (path === '/api/admin/match/walkover') return matchWalkover(request, db);

  // CRUD resources
  if (path === '/api/admin/matches') return adminMatches(db);
  if (path === '/api/admin/control') return adminControl(db);
  if (path === '/api/admin/players') return adminPlayers(request, url, db);
  if (path === '/api/admin/players/import') return adminPlayersImport(request, db);
  if (path === '/api/admin/teams') return adminTeams(request, url, db);
  if (path === '/api/admin/tournament') return adminTournament(request, db);
  if (path === '/api/admin/events') return adminEvents(request, url, db);
  if (path === '/api/admin/backup') return adminBackup(db);
  if (path === '/api/admin/backups') return adminBackups(db);
  if (path === '/api/admin/notice') return adminNotice(request, db);

  // Draw
  if (path === '/api/admin/draw') return adminDraw(url, db);
  if (path.startsWith('/api/admin/draw/')) return adminDrawAction(path.replace('/api/admin/draw/', ''), request, db);

  // Team draw & match
  if (path === '/api/admin/team_draw') return adminTeamDraw(url, db);
  if (path.startsWith('/api/admin/team_draw/')) return adminTeamDrawAction(path.replace('/api/admin/team_draw/', ''), request, db);
  if (path === '/api/admin/team_match') return adminTeamMatch(url, db);
  if (path.startsWith('/api/admin/team_match/')) return adminTeamMatchAction(path.replace('/api/admin/team_match/', ''), request, db);

  // Exports
  if (path.startsWith('/api/admin/export/')) return adminExport(path.replace('/api/admin/export/', ''), url, db);

  // Excel imports
  if (path === '/api/admin/import/excel') return adminImportExcel(request, db);
  if (path === '/api/admin/import/referees') return adminImportReferees(request, db);
  if (path === '/api/admin/import/ratings') return adminImportRatings(request, db);
  if (path === '/api/admin/import/events') return adminImportEvents(request, db);
  if (path === '/api/admin/import/leaders') return adminImportLeaders(request, db);
  if (path === '/api/admin/import/scores') return adminImportScores(request, db);
  if (path === '/api/admin/import/groups') return adminImportGroups(request, db);

  // Scoresheet & result book
  if (path === '/api/admin/scoresheet') return adminScoresheet(url, db);
  if (path === '/api/admin/resultbook') return adminResultBook(url, db);
  if (path === '/api/admin/calc_ratings') return adminCalcRatings(request, db);

  // RecordPage (HTML)
  if (path === '/RecordPage') return recordPage(request, db);

  return json({ error: 'not found' }, 404);
}

// POST /api/admin/match/save
async function matchSave(request: Request, db: D1Database) {
  const req = await request.json() as { match_id: number; scores: { game: number; left: number; right: number }[] };
  await db.prepare('DELETE FROM scores WHERE match_id=?').bind(req.match_id).run();
  let w1 = 0, w2 = 0;
  for (const s of req.scores) {
    await db.prepare('INSERT INTO scores (match_id, game_no, score_left, score_right) VALUES (?,?,?,?)')
      .bind(req.match_id, s.game, s.left, s.right).run();
    if (s.left > s.right) w1++; else if (s.right > s.left) w2++;
  }
  const result = `${w1}:${w2}`;
  const winner = w1 > w2 ? 1 : w2 > w1 ? 2 : 0;
  await db.prepare('UPDATE matches SET result=?, status=?, winner_side=? WHERE id=?')
    .bind(result, 'finished', winner, req.match_id).run();
  return json({ success: true, result });
}

// POST /api/admin/match/status
async function matchStatus(request: Request, db: D1Database) {
  const req = await request.json() as { match_id: number; status: string };
  await db.prepare('UPDATE matches SET status=? WHERE id=?').bind(req.status, req.match_id).run();
  return json({ success: true });
}

// POST /api/admin/match/walkover
async function matchWalkover(request: Request, db: D1Database) {
  const req = await request.json() as { match_id: number; walkover_side: number };
  const ev = await db.prepare('SELECT COALESCE(e.best_of,5) as bo FROM matches m JOIN events e ON m.event_id=e.id WHERE m.id=?')
    .bind(req.match_id).first();
  const winsNeeded = Math.floor((ev?.bo as number || 5) / 2) + 1;

  let result: string, winnerSide: number;
  switch (req.walkover_side) {
    case 1: result = `W-0:${winsNeeded}`; winnerSide = 2; break;
    case 2: result = `${winsNeeded}:W-0`; winnerSide = 1; break;
    case 3: result = '双弃权'; winnerSide = 0; break;
    default: return json({ success: false, error: 'invalid side' });
  }

  await db.prepare('DELETE FROM scores WHERE match_id=?').bind(req.match_id).run();
  if (req.walkover_side !== 3) {
    for (let i = 1; i <= winsNeeded; i++) {
      const [sl, sr] = req.walkover_side === 1 ? [65535, 11] : [11, 65535];
      await db.prepare('INSERT INTO scores (match_id, game_no, score_left, score_right) VALUES (?,?,?,?)')
        .bind(req.match_id, i, sl, sr).run();
    }
  }
  await db.prepare("UPDATE matches SET result=?, status='finished', winner_side=? WHERE id=?")
    .bind(result, winnerSide, req.match_id).run();
  return json({ success: true, result });
}

// GET /api/admin/matches
async function adminMatches(db: D1Database) {
  const { results } = await db.prepare(`
    SELECT m.match_order as pid, m.table_no as 'table', m.time, m.status, m.result,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2, e.title as event
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    ORDER BY m.status DESC, m.time, m.match_order
  `).all();
  return json({ matches: results });
}

// GET /api/admin/control
async function adminControl(db: D1Database) {
  const t = await db.prepare('SELECT COALESCE(tables_count,8) as tc FROM tournaments WHERE id=1').first();
  const tables = (t?.tc as number) || 8;

  const { results: playing } = await db.prepare(`
    SELECT m.id, m.match_order as pid, m.table_no as 'table', m.time, m.status, m.result,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2,
      COALESCE(m.team1_id,0) as t1id, COALESCE(m.team3_id,0) as t3id, e.event_type
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.status IN ('playing','finished') ORDER BY m.table_no
  `).all();

  const { results: queue } = await db.prepare(`
    SELECT m.match_order as pid, m.time, COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2,
      e.title as event, COALESCE(m.team1_id,0) as t1id, COALESCE(m.team3_id,0) as t3id
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.status='scheduled' ORDER BY m.time, m.match_order LIMIT 20
  `).all();

  return json({
    tables,
    playing: playing.map(r => ({
      ...r, walkover: String(r.result).includes('W-0') || r.result === '双弃权',
      same_team: (r.t1id as number) > 0 && r.t1id === r.t3id,
    })),
    queue: queue.map(r => ({ ...r, same_team: (r.t1id as number) > 0 && r.t1id === r.t3id })),
  });
}

// /api/admin/players
async function adminPlayers(request: Request, url: URL, db: D1Database) {
  if (request.method === 'GET') {
    const id = getParam(url, 'id');
    if (id) {
      const p = await db.prepare('SELECT id, name, gender, COALESCE(team_id,0) as team_id FROM players WHERE id=?').bind(id).first();
      return json({ player: p });
    }
    const { results } = await db.prepare(`SELECT p.id, p.name, p.gender, COALESCE(t.short_name,'') as team
      FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY p.id`).all();
    return json({ players: results });
  }
  if (request.method === 'DELETE') {
    await db.prepare('DELETE FROM players WHERE id=?').bind(getParam(url, 'id')).run();
    return json({ success: true });
  }
  // POST
  const req = await request.json() as { id?: number; name: string; gender: string; team_id?: number };
  if (!req.id) {
    await db.prepare('INSERT INTO players (tournament_id, name, gender, team_id) VALUES (1,?,?,?)').bind(req.name, req.gender, req.team_id || 0).run();
  } else {
    await db.prepare('UPDATE players SET name=?, gender=?, team_id=? WHERE id=?').bind(req.name, req.gender, req.team_id || 0, req.id).run();
  }
  return json({ success: true });
}

// POST /api/admin/players/import
async function adminPlayersImport(request: Request, db: D1Database) {
  const req = await request.json() as { data: string };
  const lines = req.data.replace(/\r\n/g, '\n').split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(',');
    const name = parts[0]?.trim();
    if (!name) continue;
    const gender = parts[1]?.trim() || 'M';
    const teamName = parts[2]?.trim() || '';
    let teamId = 0;
    if (teamName) {
      const t = await db.prepare('SELECT id FROM teams WHERE name=? OR short_name=?').bind(teamName, teamName).first();
      if (t) { teamId = t.id as number; }
      else {
        const r = await db.prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1,?,?)').bind(teamName, teamName).run();
        teamId = r.meta.last_row_id as number;
      }
    }
    await db.prepare('INSERT INTO players (tournament_id, name, gender, team_id) VALUES (1,?,?,?)').bind(name, gender, teamId).run();
    count++;
  }
  return json({ success: true, count });
}

// /api/admin/teams
async function adminTeams(request: Request, url: URL, db: D1Database) {
  if (request.method === 'GET') {
    const id = getParam(url, 'id');
    if (id) {
      const t = await db.prepare("SELECT id, name, COALESCE(short_name,'') as short_name FROM teams WHERE id=?").bind(id).first();
      return json({ team: t });
    }
    const { results } = await db.prepare(`SELECT t.id, t.name, COALESCE(t.short_name,'') as short_name,
      (SELECT COUNT(*) FROM players WHERE team_id=t.id) as count FROM teams t WHERE t.tournament_id=1 ORDER BY t.id`).all();
    return json({ teams: results });
  }
  if (request.method === 'DELETE') {
    await db.prepare('DELETE FROM teams WHERE id=?').bind(getParam(url, 'id')).run();
    return json({ success: true });
  }
  const req = await request.json() as { id?: number; name: string; short_name: string };
  if (!req.id) {
    await db.prepare('INSERT INTO teams (tournament_id, name, short_name) VALUES (1,?,?)').bind(req.name, req.short_name).run();
  } else {
    await db.prepare('UPDATE teams SET name=?, short_name=? WHERE id=?').bind(req.name, req.short_name, req.id).run();
  }
  return json({ success: true });
}

// /api/admin/tournament
async function adminTournament(request: Request, db: D1Database) {
  if (request.method === 'GET') {
    const t = await db.prepare("SELECT COALESCE(info,'') as info, COALESCE(venue,'') as venue, COALESCE(start_date,'') as start_date, tables_count as tables FROM tournaments WHERE id=1").first();
    return json(t || {});
  }
  const req = await request.json() as { info: string; venue: string; start_date: string };
  await db.prepare('UPDATE tournaments SET info=?, venue=?, start_date=? WHERE id=1').bind(req.info, req.venue, req.start_date).run();
  return json({ success: true });
}

// /api/admin/events
async function adminEvents(request: Request, url: URL, db: D1Database) {
  if (request.method === 'GET') {
    const id = getParam(url, 'id');
    if (id) {
      const e = await db.prepare("SELECT id, title, event_type as type, COALESCE(stage,'loop') as stage, groups, best_of FROM events WHERE id=?").bind(id).first();
      return json({ event: e });
    }
    const { results } = await db.prepare("SELECT id, title, event_type as type, COALESCE(stage,'loop') as stage, groups, best_of FROM events WHERE tournament_id=1").all();
    return json({ events: results });
  }
  if (request.method === 'DELETE') {
    const id = getParam(url, 'id');
    await db.batch([
      db.prepare('DELETE FROM matches WHERE event_id=?').bind(id),
      db.prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id=?)').bind(id),
      db.prepare('DELETE FROM group_tables WHERE event_id=?').bind(id),
      db.prepare('DELETE FROM events WHERE id=?').bind(id),
    ]);
    return json({ success: true });
  }
  const req = await request.json() as { id?: number; title: string; type: string; stage?: string; groups: number; best_of: number };
  const stage = req.stage || 'loop';
  if (!req.id) {
    const key = `${req.type}${Date.now() % 10000}`;
    const r = await db.prepare('INSERT INTO events (tournament_id, key, event_type, title, stage, groups, best_of) VALUES (1,?,?,?,?,?,?)')
      .bind(key, req.type, req.title, stage, req.groups, req.best_of).run();
    if (stage === 'loop') {
      const evId = r.meta.last_row_id;
      for (let i = 1; i <= req.groups; i++) {
        await db.prepare('INSERT INTO group_tables (event_id, group_name, group_index) VALUES (?,?,?)').bind(evId, `${i} 组`, i).run();
      }
    }
  } else {
    await db.prepare('UPDATE events SET title=?, event_type=?, stage=?, groups=?, best_of=? WHERE id=?')
      .bind(req.title, req.type, stage, req.groups, req.best_of, req.id).run();
  }
  return json({ success: true });
}

// GET /api/admin/draw
async function adminDraw(url: URL, db: D1Database) {
  const eventId = getParam(url, 'event');
  const { results: gRows } = await db.prepare('SELECT id, group_name FROM group_tables WHERE event_id=? ORDER BY group_index').bind(eventId).all();
  const assignedIds: number[] = [];
  const groups = [];
  for (const g of gRows) {
    const { results: pRows } = await db.prepare(`SELECT ge.player_id as id, ge.position, p.name
      FROM group_entries ge JOIN players p ON ge.player_id=p.id WHERE ge.group_id=? ORDER BY ge.position`).bind(g.id).all();
    pRows.forEach(p => assignedIds.push(p.id as number));
    groups.push({ id: g.id, name: g.group_name, players: pRows });
  }
  const { results: allPlayers } = await db.prepare(`SELECT p.id, p.name, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY p.name`).all();
  const unassigned = allPlayers.filter(p => !assignedIds.includes(p.id as number));
  return json({ groups, unassigned });
}

// POST /api/admin/draw/*
async function adminDrawAction(action: string, request: Request, db: D1Database) {
  const req = await request.json() as Record<string, any>;

  switch (action) {
    case 'assign': {
      const gRow = await db.prepare('SELECT id FROM group_tables WHERE event_id=? AND group_index=?').bind(req.event_id, req.group_index).first();
      const maxP = await db.prepare('SELECT COALESCE(MAX(position),0) as mp FROM group_entries WHERE group_id=?').bind(gRow!.id).first();
      await db.prepare('INSERT INTO group_entries (group_id, player_id, position) VALUES (?,?,?)').bind(gRow!.id, req.player_id, (maxP!.mp as number) + 1).run();
      break;
    }
    case 'remove':
      await db.prepare('DELETE FROM group_entries WHERE group_id=? AND player_id=?').bind(req.group_id, req.player_id).run();
      break;
    case 'clear':
      await db.prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id=?)').bind(req.event_id).run();
      break;
    case 'auto': {
      await db.prepare('DELETE FROM group_entries WHERE group_id IN (SELECT id FROM group_tables WHERE event_id=?)').bind(req.event_id).run();
      const { results: gs } = await db.prepare('SELECT id FROM group_tables WHERE event_id=? ORDER BY group_index').bind(req.event_id).all();
      const { results: ps } = await db.prepare('SELECT id FROM players WHERE tournament_id=1 ORDER BY RANDOM()').all();
      for (let i = 0; i < ps.length; i++) {
        const gid = gs[i % gs.length].id;
        const mp = await db.prepare('SELECT COALESCE(MAX(position),0)+1 as p FROM group_entries WHERE group_id=?').bind(gid).first();
        await db.prepare('INSERT INTO group_entries (group_id, player_id, position) VALUES (?,?,?)').bind(gid, ps[i].id, mp!.p).run();
      }
      break;
    }
    case 'matches': {
      await db.prepare('DELETE FROM matches WHERE event_id=?').bind(req.event_id).run();
      const stageRow = await db.prepare("SELECT COALESCE(stage,'loop') as s FROM events WHERE id=?").bind(req.event_id).first();
      const stage = stageRow?.s as string;
      let matchOrder = 90001, count = 0;

      if (stage === 'knockout') {
        const { results: ps } = await db.prepare(`SELECT ge.player_id FROM group_entries ge
          JOIN group_tables gt ON ge.group_id=gt.id WHERE gt.event_id=? ORDER BY ge.position`).bind(req.event_id).all();
        const n = ps.length;
        let rounds = 0; for (let p = 1; p < n; p *= 2) rounds++;
        for (let i = 0; i < Math.floor(n / 2); i++) {
          const p1 = ps[i * 2]?.player_id || 0, p2 = ps[i * 2 + 1]?.player_id || 0;
          await db.prepare("INSERT INTO matches (event_id, round, match_order, player1_id, player2_id, status, table_no, time) VALUES (?,1,?,?,?,'scheduled',?,'')")
            .bind(req.event_id, matchOrder, p1, p2, (count % 8) + 1).run();
          matchOrder++; count++;
        }
        for (let r = 2; r <= rounds; r++) {
          for (let i = 0; i < n / (1 << r); i++) {
            await db.prepare("INSERT INTO matches (event_id, round, match_order, player1_id, player2_id, status, table_no, time) VALUES (?,?,?,0,0,'scheduled',?,'')")
              .bind(req.event_id, r, matchOrder, (count % 8) + 1).run();
            matchOrder++; count++;
          }
        }
      } else {
        const { results: gs } = await db.prepare('SELECT id FROM group_tables WHERE event_id=?').bind(req.event_id).all();
        for (const g of gs) {
          const { results: ps } = await db.prepare('SELECT player_id FROM group_entries WHERE group_id=? ORDER BY position').bind(g.id).all();
          for (let i = 0; i < ps.length; i++) {
            for (let j = i + 1; j < ps.length; j++) {
              await db.prepare("INSERT INTO matches (event_id, group_id, match_order, player1_id, player2_id, status, table_no, time) VALUES (?,?,?,?,?,'scheduled',?,'')")
                .bind(req.event_id, g.id, matchOrder, ps[i].player_id, ps[j].player_id, (count % 8) + 1).run();
              matchOrder++; count++;
            }
          }
        }
      }
      return json({ success: true, count });
    }
    case 'schedule': {
      const { results: rows } = await db.prepare('SELECT id FROM matches WHERE event_id=? ORDER BY match_order').bind(req.event_id).all();
      let [h, m] = (req.start_time as string).split(':').map(Number);
      for (const r of rows) {
        await db.prepare('UPDATE matches SET time=? WHERE id=?').bind(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, r.id).run();
        m += 10; if (m >= 60) { m = 0; h++; }
      }
      break;
    }
  }
  return json({ success: true });
}

// GET /api/admin/team_draw
async function adminTeamDraw(url: URL, db: D1Database) {
  const eventId = getParam(url, 'event');
  const { results: teams } = await db.prepare(`SELECT t.id, t.name, (SELECT COUNT(*) FROM players WHERE team_id=t.id) as count
    FROM teams t WHERE t.tournament_id=1`).all();
  const { results: matches } = await db.prepare(`SELECT m.id, m.match_order as 'order', m.status, m.result,
    COALESCE(t1.name,'') as team1, COALESCE(t2.name,'') as team2
    FROM matches m LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.event_id=? AND m.team1_id>0 AND m.group_id=0 ORDER BY m.match_order`).bind(eventId).all();
  return json({ teams, matches });
}

// POST /api/admin/team_draw/*
async function adminTeamDrawAction(action: string, request: Request, db: D1Database) {
  const req = await request.json() as Record<string, any>;
  if (action === 'generate') {
    await db.prepare('DELETE FROM matches WHERE event_id=?').bind(req.event_id).run();
    const { results: teams } = await db.prepare('SELECT id FROM teams WHERE tournament_id=1').all();
    let matchOrder = 80001, count = 0;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        await db.prepare("INSERT INTO matches (event_id, match_order, team1_id, team2_id, status, table_no) VALUES (?,?,?,?,'scheduled',?)")
          .bind(req.event_id, matchOrder, teams[i].id, teams[j].id, (count % 8) + 1).run();
        matchOrder++; count++;
      }
    }
    return json({ success: true, count });
  }
  return json({ success: true });
}

// GET /api/admin/team_match
async function adminTeamMatch(url: URL, db: D1Database) {
  const id = getParam(url, 'id');
  const m = await db.prepare(`SELECT m.match_order as 'order', m.event_id, e.title as event, m.team1_id, m.team2_id,
    COALESCE(t1.name,'') as team1, COALESCE(t2.name,'') as team2, COALESCE(m.result,'') as result
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id WHERE m.id=?`).bind(id).first();
  if (!m) return json({ error: 'not found' }, 404);

  let { results: subs } = await db.prepare("SELECT id, COALESCE(player1_id,0) as player1_id, COALESCE(player2_id,0) as player2_id, COALESCE(result,'') as result, status FROM matches WHERE group_id=? ORDER BY match_order").bind(id).all();
  if (!subs.length) {
    for (let i = 1; i <= 5; i++) {
      const r = await db.prepare("INSERT INTO matches (event_id, group_id, match_order, status) VALUES (?,?,?,'scheduled')").bind(m.event_id, id, 80000 + i).run();
      subs.push({ id: r.meta.last_row_id, player1_id: 0, player2_id: 0, result: '', status: 'scheduled' });
    }
  }

  const getPlayers = async (tid: number) => (await db.prepare('SELECT id, name FROM players WHERE team_id=?').bind(tid).all()).results;
  let s1 = 0, s2 = 0;
  for (const s of subs) {
    const res = s.result as string;
    if (res) { const [a, b] = res.split(':').map(Number); if (a > b) s1++; else if (b > a) s2++; }
  }

  return json({
    order: m.order, event: m.event, team1: m.team1, team2: m.team2, result: m.result,
    score1: s1, score2: s2, sub_matches: subs,
    team1_players: await getPlayers(m.team1_id as number), team2_players: await getPlayers(m.team2_id as number),
  });
}

// POST /api/admin/team_match/*
async function adminTeamMatchAction(action: string, request: Request, db: D1Database) {
  const req = await request.json() as Record<string, any>;
  if (action === 'sub') {
    const status = req.result ? 'finished' : 'scheduled';
    await db.prepare('UPDATE matches SET player1_id=?, player2_id=?, result=?, status=? WHERE id=?')
      .bind(req.player1_id, req.player2_id, req.result, status, req.id).run();
  } else if (action === 'finish') {
    const { results } = await db.prepare("SELECT result FROM matches WHERE group_id=? AND result IS NOT NULL AND result!=''").bind(req.id).all();
    let s1 = 0, s2 = 0;
    for (const r of results) { const [a, b] = (r.result as string).split(':').map(Number); if (a > b) s1++; else if (b > a) s2++; }
    const result = `${s1}:${s2}`;
    const winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
    await db.prepare("UPDATE matches SET result=?, status='finished', winner_side=? WHERE id=?").bind(result, winner, req.id).run();
    return json({ success: true, result });
  }
  return json({ success: true });
}

// GET /api/admin/export/*
async function adminExport(typ: string, url: URL, db: D1Database) {
  const eventId = getParam(url, 'event');
  let csv = '\uFEFF'; // UTF-8 BOM
  switch (typ) {
    case 'players': {
      csv += '姓名,性别,队伍\n';
      const { results } = await db.prepare("SELECT p.name, p.gender, COALESCE(t.name,'') as team FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1").all();
      results.forEach(r => { csv += `${r.name},${r.gender},${r.team}\n`; });
      break;
    }
    case 'schedule': {
      csv += '场次,时间,球台,选手1,选手2,项目\n';
      const { results } = await db.prepare(`SELECT m.match_order, m.time, m.table_no, COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, e.title
        FROM matches m JOIN events e ON m.event_id=e.id LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
        WHERE (? = '' OR m.event_id = ?) ORDER BY m.time, m.match_order`).bind(eventId, eventId).all();
      results.forEach(r => { csv += `${r.match_order},${r.time},${r.table_no},${r.p1},${r.p2},${r.title}\n`; });
      break;
    }
    case 'results': {
      csv += '场次,选手1,选手2,比分,结果,项目\n';
      const { results } = await db.prepare(`SELECT m.match_order, COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, m.result, m.status, e.title
        FROM matches m JOIN events e ON m.event_id=e.id LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
        WHERE m.status='finished' AND (? = '' OR m.event_id = ?) ORDER BY m.match_order`).bind(eventId, eventId).all();
      results.forEach(r => { csv += `${r.match_order},${r.p1},${r.p2},${r.result},${r.status},${r.title}\n`; });
      break;
    }
    case 'ranking': {
      csv += '组别,名次,姓名,队伍\n';
      const { results } = await db.prepare(`SELECT gt.group_name, ge.rank, p.name, COALESCE(t.short_name,'') as team
        FROM group_entries ge JOIN group_tables gt ON ge.group_id=gt.id JOIN players p ON ge.player_id=p.id
        LEFT JOIN teams t ON p.team_id=t.id WHERE (? = '' OR gt.event_id = ?) ORDER BY gt.group_index, ge.rank`).bind(eventId, eventId).all();
      results.forEach(r => { csv += `${r.group_name},${r.rank},${r.name},${r.team}\n`; });
      break;
    }
  }
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=${typ}.csv` } });
}

// GET /api/admin/backup - export D1 data as JSON
async function adminBackup(db: D1Database) {
  const tables = ['tournaments', 'events', 'teams', 'players', 'group_tables', 'group_entries', 'matches', 'scores', 'notices', 'brackets', 'draws', 'referees', 'leaders', 'ratings', 'settings'];
  const data: Record<string, unknown[]> = {};
  for (const t of tables) {
    try { const { results } = await db.prepare(`SELECT * FROM ${t}`).all(); data[t] = results; } catch { data[t] = []; }
  }
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename=paddlepal-backup-${Date.now()}.json` },
  });
}

// GET /api/admin/backups - list is N/A for D1, return empty
async function adminBackups(_db: D1Database) {
  return json({ backups: [], note: 'D1 uses time-travel recovery. Use dashboard for point-in-time restore.' });
}

// Stub handlers for features to be implemented
async function adminNotice(request: Request, db: D1Database) {
  if (request.method === 'GET') {
    const { results } = await db.prepare("SELECT id, COALESCE(title,'') as title, content, created_at FROM notices ORDER BY created_at DESC").all();
    return json({ notices: results });
  }
  const req = await request.json() as { id?: number; title: string; content: string };
  if (!req.id) {
    await db.prepare("INSERT INTO notices (tournament_id, title, content, created_at) VALUES (1,?,?,datetime('now'))").bind(req.title, req.content).run();
  } else {
    await db.prepare('UPDATE notices SET title=?, content=? WHERE id=?').bind(req.title, req.content, req.id).run();
  }
  return json({ success: true });
}

async function adminImportExcel(_request: Request, _db: D1Database) { return json({ success: false, error: 'Excel import: use /api/admin/players/import with CSV for now' }); }
async function adminImportReferees(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO' }); }
async function adminImportRatings(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO' }); }
async function adminImportEvents(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO' }); }
async function adminImportLeaders(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO' }); }
async function adminImportScores(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO' }); }
async function adminImportGroups(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO' }); }
async function adminScoresheet(_url: URL, _db: D1Database) { return json({ success: false, error: 'TODO: scoresheet generation' }); }
async function adminResultBook(_url: URL, _db: D1Database) { return json({ success: false, error: 'TODO: result book generation' }); }
async function adminCalcRatings(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO: rating calculation' }); }
async function recordPage(_request: Request, _db: D1Database) { return json({ success: false, error: 'TODO: record page HTML' }); }
