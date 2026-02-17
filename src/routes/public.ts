import { Env } from '../types';
import { json, getParam, getFormData } from '../utils';

export async function handlePublicRoute(path: string, request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const db = env.DB;

  switch (path) {
    case '/rawinfo': return rawinfo(db);
    case '/allplay': return allplay(db);
    case '/playing': return playing(db);
    case '/toplay': return toplay(db);
    case '/oneplay': return oneplay(request, db);
    case '/playscore': return playscore(request, db);
    case '/playrank': return playrank(request, db);
    case '/playtime': return playtime(request, db);
    case '/playcull': return playcull(request, db);
    case '/teammember': return teammember(url, db);
    case '/notice': return notice(db);
    case '/member': return member(db);
    case '/InquiryPage': return inquiryPage(request, db);
    case '/PlayinfoPage': return playinfoPage(request, db);
    default: return json({ error: 'not found' }, 404);
  }
}

async function getScores(db: D1Database, matchId: number) {
  const { results } = await db.prepare(
    'SELECT score_left, score_right FROM scores WHERE match_id=? ORDER BY game_no'
  ).bind(matchId).all();
  return results.map(r => ({ l: r.score_left as number, r: r.score_right as number }));
}

async function getFormParam(request: Request, key: string) {
  const data = await getFormData(request);
  return (data as Record<string, string>)[key] || '';
}

// GET /rawinfo
async function rawinfo(db: D1Database) {
  const t = await db.prepare(
    "SELECT COALESCE(info,'') as info, COALESCE(venue,'') as addr, COALESCE(start_date,'') as date, tables_count, days FROM tournaments WHERE id=1"
  ).first();
  const info = t?.info ?? '';
  const addr = t?.addr ?? '';
  const date = t?.date ?? '';
  const tables = t?.tables_count ?? 8;
  const days = t?.days ?? 1;

  const { results: events } = await db.prepare(`
    SELECT e.id, e.key, e.event_type, e.title, e.groups,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id) as plays,
      (SELECT COUNT(*) FROM matches WHERE event_id=e.id AND status='finished') as finish,
      (SELECT MIN(time) FROM matches WHERE event_id=e.id) as beg_time,
      (SELECT MAX(time) FROM matches WHERE event_id=e.id) as end_time
    FROM events e WHERE e.tournament_id=1 ORDER BY e.id
  `).all();

  const match = events.map(e => {
    const plays = e.plays as number;
    const finish = e.finish as number;
    const progress = plays > 0 ? `${Math.floor(finish * 100 / plays)}%` : '0%';
    return {
      key: e.key, group: '', event: e.event_type, stage: 1, extra: 1,
      title: e.title, all: plays, in: 0, begrank: 1, groups: e.groups,
      plays, edits: finish, unedits: plays - finish,
      names: plays, records: finish, finish,
      beg_time: e.beg_time ?? '', end_time: e.end_time ?? '', progress,
    };
  });

  return json({ info, addr, tables, date, days, match });
}

// GET /allplay
async function allplay(db: D1Database) {
  const t = await db.prepare(
    "SELECT COALESCE(info,'') as info, COALESCE(venue,'') as addr, COALESCE(start_date,'') as date, tables_count, days FROM tournaments WHERE id=1"
  ).first();

  const { results: events } = await db.prepare(
    'SELECT id, key, event_type, title, groups FROM events WHERE tournament_id=1 ORDER BY id'
  ).all();

  const match = [];
  for (const ev of events) {
    const { results: rows } = await db.prepare(`
      SELECT m.id, m.status, m.match_order, m.round, m.date, m.time, m.table_no, m.result,
        m.seat1, m.seat2,
        COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2,
        COALESCE(p3.name,'') as p3, COALESCE(p4.name,'') as p4,
        COALESCE(t1.short_name,'') as t1, COALESCE(t2.short_name,'') as t2,
        COALESCE(t3.short_name,'') as t3, COALESCE(t4.short_name,'') as t4
      FROM matches m
      LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
      LEFT JOIN players p3 ON m.player3_id=p3.id LEFT JOIN players p4 ON m.player4_id=p4.id
      LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
      LEFT JOIN teams t3 ON m.team3_id=t3.id LEFT JOIN teams t4 ON m.team4_id=t4.id
      WHERE m.event_id=? ORDER BY m.round, m.match_order
    `).bind(ev.id).all();

    const play = rows.map(r => {
      const state = r.status === 'playing' ? 2 : r.status === 'finished' ? 3 : 1;
      return {
        state, pid: r.match_order, loop: r.round, date: parseInt(r.date as string) || 0,
        time: r.time, table: `${r.table_no}`, result: r.result,
        seat1: r.seat1, seat2: r.seat2,
        player1: r.p1, player2: r.p2, player3: r.p3, player4: r.p4,
        team1: r.t1, team2: r.t2, team3: r.t3, team4: r.t4,
      };
    });
    match.push({
      name: ev.key, group: '', event: ev.event_type, stage: 1, extra: 1,
      title: ev.title, groupcnt: ev.groups, play,
    });
  }

  return json({ info: t?.info ?? '', addr: t?.addr ?? '', tables: t?.tables_count ?? 8, date: t?.date ?? '', days: t?.days ?? 1, match });
}

// GET /playing
async function playing(db: D1Database) {
  const { results: rows } = await db.prepare(`
    SELECT m.id, m.table_no, m.time, e.key, e.event_type,
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
    arr.push({
      id: r.id, tb: r.table_no, tm: r.time, gp: r.key, ev: r.event_type,
      nl: r.nl, nr: r.nr, tl: r.tl, tr: r.tr, tnl: r.tnl, tnr: r.tnr,
      result: r.result, score: scores,
    });
  }
  return json({ array: arr });
}

// GET /toplay
async function toplay(db: D1Database) {
  const { results: rows } = await db.prepare(`
    SELECT m.id, m.table_no, m.time, e.key, e.event_type,
      COALESCE(p1.name,'') as nl, COALESCE(p2.name,'') as nr,
      COALESCE(t1.flag,'') as tl, COALESCE(t2.flag,'') as tr,
      COALESCE(t1.short_name,'') as tnl, COALESCE(t2.short_name,'') as tnr
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.status='scheduled' ORDER BY m.time, m.table_no LIMIT 20
  `).all();

  const arr = rows.map(r => ({
    id: r.id, tb: r.table_no, tm: r.time, gp: r.key, ev: r.event_type,
    nl: r.nl, nr: r.nr, tl: r.tl, tr: r.tr, tnl: r.tnl, tnr: r.tnr,
  }));
  return json({ array: arr });
}

// POST /oneplay
async function oneplay(request: Request, db: D1Database) {
  const pid = await getFormParam(request, 'pid');
  const r = await db.prepare(`
    SELECT m.id, e.id as eid, e.key, e.event_type, e.title, e.groups,
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

  if (!r) return json({});

  const scores = await getScores(db, r.id as number);
  const scoreArr = scores.map(s => [s.l, s.r]);
  const evType = r.event_type as string;

  const play: Record<string, unknown> = {
    pid, date: r.date, time: r.time, table: `${r.table_no}台`,
    seat1: r.seat1, seat2: r.seat2,
    player1: r.p1, player2: r.p2, player3: r.p3, player4: r.p4,
    team1: r.t1, team2: r.t2, team3: r.t3, team4: r.t4,
    result: r.result, score: scoreArr,
  };

  // Team match: add sub-match details
  if (evType.includes('T')) {
    const { results: mRows } = await db.prepare(`
      SELECT m.id, COALESCE(pa.name,'') as l1, COALESCE(pb.name,'') as l2,
        COALESCE(pc.name,'') as r1, COALESCE(pd.name,'') as r2
      FROM matches m
      LEFT JOIN players pa ON m.player1_id=pa.id LEFT JOIN players pb ON m.player2_id=pb.id
      LEFT JOIN players pc ON m.player3_id=pc.id LEFT JOIN players pd ON m.player4_id=pd.id
      WHERE m.group_id=? ORDER BY m.match_order
    `).bind(r.id).all();

    const members = [];
    const teamScores = [];
    for (const mr of mRows) {
      members.push({ l1: mr.l1, l2: mr.l2, r1: mr.r1, r2: mr.r2 });
      const ss = await getScores(db, mr.id as number);
      teamScores.push(ss.map(s => [s.l, s.r]));
    }
    play.member = members;
    play.score = teamScores;
  }

  return json({
    name: r.key, group: '', event: evType, stage: 1, extra: 1,
    title: r.title, groupcnt: r.groups, play,
  });
}

// POST /playscore
async function playscore(request: Request, db: D1Database) {
  const key = await getFormParam(request, 'key');
  const ev = await db.prepare('SELECT id, event_type, title, groups FROM events WHERE key=?').bind(key).first();
  if (!ev) return json({ key, title: '', event: '', groups: 0, score: [] });
  const score = await buildCrossTable(db, ev.id as number, false);
  return json({
    key, group: '', event: ev.event_type, stage: 1, extra: 1, title: ev.title,
    all: 0, in: 0, begrank: 1, groups: ev.groups, score,
  });
}

// POST /playtime
async function playtime(request: Request, db: D1Database) {
  const key = await getFormParam(request, 'key');
  const ev = await db.prepare('SELECT id, event_type, title, groups FROM events WHERE key=?').bind(key).first();
  if (!ev) return json({ key, title: '', event: '', groups: 0, score: [] });
  const score = await buildCrossTable(db, ev.id as number, true);
  return json({
    key, group: '', event: ev.event_type, stage: 1, extra: 1, title: ev.title,
    all: 0, in: 0, begrank: 1, groups: ev.groups, score,
  });
}

async function buildCrossTable(db: D1Database, evId: number, showTime: boolean) {
  const evRow = await db.prepare('SELECT event_type FROM events WHERE id=?').bind(evId).first();
  const evType = (evRow?.event_type as string) || '';

  const { results: groups } = await db.prepare(
    'SELECT id, group_name FROM group_tables WHERE event_id=? ORDER BY group_index'
  ).bind(evId).all();

  const score: unknown[] = [];
  for (const g of groups) {
    const gId = g.id as number;
    const { results: entryRows } = await db.prepare(`
      SELECT ge.player_id, ge.position, ge.rank, COALESCE(p.name,'') as name, COALESCE(t.short_name,'') as team
      FROM group_entries ge
      LEFT JOIN players p ON ge.player_id=p.id
      LEFT JOIN teams t ON COALESCE(ge.team_id, p.team_id)=t.id
      WHERE ge.group_id=? ORDER BY ge.position
    `).bind(gId).all();

    const entries = entryRows.map(e => ({
      pid: e.player_id as number, pos: e.position as number,
      rank: e.rank as number, name: e.name as string, team: e.team as string,
    }));

    // For doubles, enrich names
    if (evType.includes('D') || evType.includes('d')) {
      for (const e of entries) {
        const partner = await db.prepare(`
          SELECT COALESCE(p2.name,'') as p2name, COALESCE(t1.short_name,'') as t1name
          FROM matches m LEFT JOIN players p2 ON m.player2_id=p2.id LEFT JOIN teams t1 ON m.team1_id=t1.id
          WHERE m.event_id=? AND m.player1_id=? LIMIT 1
        `).bind(evId, e.pid).first();
        if (partner?.p2name) e.name += '/' + partner.p2name;
        if (partner?.t1name) e.team = partner.t1name as string;
      }
    }

    const n = entries.length;
    const header: unknown[] = [g.group_name];
    for (let i = 1; i <= n; i++) header.push(`${i}`);
    header.push('积分', '计算', '名次');

    const rows: unknown[] = [header];
    for (let i = 0; i < n; i++) {
      const e = entries[i];
      const row: unknown[] = [[e.pos, e.name, e.team]];
      let points = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) { row.push(''); continue; }
        const opp = entries[j];

        const m = await db.prepare(`
          SELECT m.id, m.match_order, m.time, m.result, m.player1_id
          FROM matches m WHERE m.group_id=? AND
          ((m.player1_id=? AND m.player3_id=?) OR (m.player1_id=? AND m.player3_id=?))
        `).bind(gId, e.pid, opp.pid, opp.pid, e.pid).first();

        if (!m) { row.push(''); continue; }

        if (showTime) {
          row.push([m.time, 'time', m.match_order]);
          continue;
        }

        const isLeft = (m.player1_id as number) === e.pid;
        const result = (m.result as string) || '';
        const { results: sRows } = await db.prepare(
          'SELECT score_left, score_right FROM scores WHERE match_id=? ORDER BY game_no'
        ).bind(m.id).all();

        let wl = 0, wr = 0;
        const leftScores: number[] = [], rightScores: number[] = [];
        for (const s of sRows) {
          const sl = s.score_left as number, sr = s.score_right as number;
          const isWO = sl === 65535 || sl === -1 || sr === 65535 || sr === -1;
          if (!isWO) { leftScores.push(sl); rightScores.push(sr); }
          if (sl > sr) wl++; else if (sr > sl) wr++;
        }

        const myWin = isLeft ? wl : wr;
        const oppWin = isLeft ? wr : wl;
        const isWalkover = result.includes('W-0');
        const isDualWalkover = result === '双弃权';
        const won = myWin > oppWin;
        const color = won ? 'red' : 'nol';

        if (won) points += 2;
        else if (!isDualWalkover && result && !(isWalkover && !won)) points += 1;

        const upperTriangle = e.pos < opp.pos;

        let cellText: string;
        const myResult = (() => {
          if (!isLeft) {
            const parts = result.split(':');
            return parts.length === 2 ? `${parts[1]}:${parts[0]}` : result;
          }
          return result;
        })();

        if (isDualWalkover) {
          cellText = '双弃权';
        } else if (upperTriangle) {
          const myPts = won ? 2 : 1;
          cellText = `${myResult}<br>---<br>${myPts}`;
        } else {
          const myS = isLeft ? leftScores : rightScores;
          const oppS = isLeft ? rightScores : leftScores;
          const parts = myS.map((s, k) => s > oppS[k] ? `${oppS[k]}` : `${-s}`);
          cellText = parts.join('<br>');
        }

        row.push([cellText, color, m.match_order]);
      }

      if (e.rank > 0 && e.rank <= 2) row.push(points, '', [e.rank, 'red']);
      else if (e.rank > 0) row.push(points, '', e.rank);
      else row.push(points, '', '');

      rows.push(row);
    }
    score.push(rows);
  }
  return score;
}

// POST /playrank
async function playrank(request: Request, db: D1Database) {
  const key = await getFormParam(request, 'key');
  const ev = await db.prepare('SELECT id, event_type, title, groups FROM events WHERE key=?').bind(key).first();
  if (!ev) return json({ key, title: '', event: '', groups: 0, info: {} });

  const { results: groups } = await db.prepare(
    'SELECT id, group_name FROM group_tables WHERE event_id=? ORDER BY group_index'
  ).bind(ev.id).all();

  const rank = [];
  for (const g of groups) {
    const { results: rows } = await db.prepare(`
      SELECT ge.rank, COALESCE(p.name,'') as name, COALESCE(t.short_name,'') as team
      FROM group_entries ge LEFT JOIN players p ON ge.player_id=p.id
      LEFT JOIN teams t ON COALESCE(ge.team_id, p.team_id)=t.id
      WHERE ge.group_id=? ORDER BY ge.rank, ge.position
    `).bind(g.id).all();
    rank.push({ group: g.group_name, rows: rows.map(r => [r.rank, r.name, r.team]) });
  }

  return json({
    key, group: '', event: ev.event_type, stage: 1, extra: 1, title: ev.title,
    all: 0, in: 0, begrank: 1, groups: ev.groups,
    info: { title: ['组号', '名次', '姓名', '队名'], rank },
  });
}

// POST /playcull
async function playcull(request: Request, db: D1Database) {
  const key = await getFormParam(request, 'key');
  const ev = await db.prepare('SELECT id, event_type, title FROM events WHERE key=?').bind(key).first();
  if (!ev) return json({ key, title: '', rounds: 0, matches: [] });

  const { results: rows } = await db.prepare(`
    SELECT m.id, m.round, m.match_order, COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2, m.result, m.winner_side
    FROM matches m LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE m.event_id=? ORDER BY m.round DESC, m.match_order
  `).bind(ev.id).all();

  let maxRound = 0;
  const matches = [];
  for (const r of rows) {
    const round = r.round as number;
    if (round > maxRound) maxRound = round;
    const { results: sRows } = await db.prepare(
      'SELECT score_left, score_right FROM scores WHERE match_id=?'
    ).bind(r.id).all();
    let s1 = 0, s2 = 0;
    for (const s of sRows) {
      if ((s.score_left as number) > (s.score_right as number)) s1++;
      else if ((s.score_right as number) > (s.score_left as number)) s2++;
    }
    matches.push({
      round, position: r.match_order, pid: r.match_order,
      player1: r.p1, player2: r.p2, result: r.result,
      winner_side: r.winner_side, score1: s1, score2: s2,
    });
  }
  return json({ key, title: ev.title, event: ev.event_type, rounds: maxRound, matches });
}

// GET /teammember
async function teammember(url: URL, db: D1Database) {
  const pid = getParam(url, 'play') || getParam(url, 'exchange');
  const exchange = !!getParam(url, 'exchange');
  const m = await db.prepare('SELECT team1_id, team2_id FROM matches WHERE match_order=?').bind(pid).first();

  async function getTeam(tid: number) {
    const t = await db.prepare('SELECT name, short_name FROM teams WHERE id=?').bind(tid).first();
    const { results } = await db.prepare('SELECT id, name, gender FROM players WHERE team_id=?').bind(tid).all();
    return { name: t?.name, short_name: t?.short_name, members: results };
  }

  return json({
    pid, exchange,
    team1: await getTeam(m?.team1_id as number),
    team2: await getTeam(m?.team2_id as number),
  });
}

// GET /notice
async function notice(db: D1Database) {
  const { results } = await db.prepare(
    "SELECT id, COALESCE(title,'') as title, content, created_at FROM notices ORDER BY created_at DESC"
  ).all();
  return json({ notices: results.map(r => ({ id: r.id, title: r.title, content: r.content, time: r.created_at })) });
}

// GET /member
async function member(db: D1Database) {
  const { results } = await db.prepare(`
    SELECT p.id, p.name, p.gender, COALESCE(t.short_name,'') as team
    FROM players p LEFT JOIN teams t ON p.team_id=t.id WHERE p.tournament_id=1 ORDER BY t.id, p.name
  `).all();
  return json({ members: results });
}

// POST /InquiryPage
async function inquiryPage(request: Request, db: D1Database) {
  const data = await getFormData(request);
  const name = (data as Record<string, string>).name || '';
  const { results } = await db.prepare(`
    SELECT m.match_order as pid, m.table_no, m.time, m.status, m.result, e.title,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    WHERE p1.name LIKE ? OR p2.name LIKE ?
    ORDER BY m.time, m.match_order
  `).bind(`%${name}%`, `%${name}%`).all();
  return json({ name, matches: results });
}

// POST /PlayinfoPage
async function playinfoPage(request: Request, db: D1Database) {
  const data = await getFormData(request);
  const pid = (data as Record<string, string>).pid || '';
  const r = await db.prepare(`
    SELECT m.id, m.match_order, m.table_no, m.time, m.status, m.result, e.title,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2,
      COALESCE(t1.short_name,'') as t1, COALESCE(t2.short_name,'') as t2
    FROM matches m JOIN events e ON m.event_id=e.id
    LEFT JOIN players p1 ON m.player1_id=p1.id LEFT JOIN players p2 ON m.player2_id=p2.id
    LEFT JOIN teams t1 ON m.team1_id=t1.id LEFT JOIN teams t2 ON m.team2_id=t2.id
    WHERE m.match_order=?
  `).bind(pid).first();
  if (!r) return json({ error: 'not found' });
  const scores = await getScores(db, r.id as number);
  return json({ ...r, scores });
}
