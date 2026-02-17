import { Hono } from 'hono';
import * as XLSX from 'xlsx';

type Bindings = { DB: D1Database; FILES: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

// Export scoresheet: GET /api/export/scoresheet/:matchId
app.get('/api/export/scoresheet/:matchId', async (c) => {
  const matchId = parseInt(c.req.param('matchId'));
  const db = c.env.DB;

  // Get match data
  const match = await db.prepare(`
    SELECT m.*, e.key as event_key, e.title as event_title, e.event_type, e.best_of,
      p1.name as player1_name, p2.name as player2_name,
      t1.name as team1_name, t1.short_name as team1_short,
      t2.name as team2_name, t2.short_name as team2_short
    FROM matches m
    JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE m.id = ?
  `).bind(matchId).first();

  if (!match) return c.json({ error: 'Match not found' }, 404);

  // Get tournament info
  const tournament = await db.prepare('SELECT name, venue FROM tournaments WHERE id = 1').first();

  // Get scores
  const { results: scores } = await db.prepare(
    'SELECT game_no, score_left, score_right FROM scores WHERE match_id = ? ORDER BY game_no'
  ).bind(matchId).all();

  // Get template from R2
  const bestOf = (match.best_of as number) || 5;
  const sheetName = `单项记分单${bestOf}`;
  const tplObj = await c.env.FILES.get('templates/BasicScoreSheet-v3.0.xlt');
  if (!tplObj) return c.json({ error: 'Template not found' }, 500);

  const tplData = await tplObj.arrayBuffer();
  const wb = XLSX.read(tplData, { type: 'array' });
  const ws = wb.Sheets[sheetName];

  if (!ws) return c.json({ error: `Sheet ${sheetName} not found` }, 500);

  // Fill data using cell addresses (based on template structure)
  // Row 3: Event info
  ws['D3'] = { t: 's', v: match.event_title || match.event_key };
  ws['H3'] = { t: 's', v: `R${match.round || 1}` };

  // Row 7: Player names
  ws['C7'] = { t: 's', v: match.player1_name || match.team1_short || '' };
  ws['C17'] = { t: 's', v: match.player2_name || match.team2_short || '' };

  // Tournament info
  ws['B2'] = { t: 's', v: tournament?.name || '' };
  ws['J3'] = { t: 's', v: tournament?.venue || '' };

  // Match info
  ws['L3'] = { t: 's', v: match.date || '' };
  ws['N3'] = { t: 's', v: match.time || '' };
  ws['P3'] = { t: 'n', v: match.table_no || 1 };

  // Fill scores if available
  const scoreStartCol = 5; // Column F
  scores.forEach((s: any, i: number) => {
    const col = scoreStartCol + i;
    const addr1 = XLSX.utils.encode_cell({ r: 7, c: col });
    const addr2 = XLSX.utils.encode_cell({ r: 17, c: col });
    ws[addr1] = { t: 'n', v: s.score_left };
    ws[addr2] = { t: 'n', v: s.score_right };
  });

  // Generate output
  const outBuf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  return new Response(outBuf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="scoresheet-${matchId}.xlsx"`
    }
  });
});

// Export match list: GET /api/export/matches/:eventKey
app.get('/api/export/matches/:eventKey', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id, title FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const { results: matches } = await db.prepare(`
    SELECT m.id, m.round, m.match_order, m.table_no, m.date, m.time, m.result, m.status,
      p1.name as p1, p2.name as p2, t1.short_name as t1, t2.short_name as t2
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE m.event_id = ? ORDER BY m.round, m.match_order
  `).bind(event.id).all();

  // Create workbook
  const data = [['轮次', '场序', '台号', '日期', '时间', '选手1', '选手2', '比分', '状态']];
  matches.forEach((m: any) => {
    data.push([
      m.round, m.match_order, m.table_no, m.date || '', m.time || '',
      m.p1 || m.t1 || '', m.p2 || m.t2 || '', m.result || '', m.status || ''
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, event.title as string || eventKey);

  const outBuf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  return new Response(outBuf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="matches-${eventKey}.xlsx"`
    }
  });
});

// Export players list: GET /api/export/players
app.get('/api/export/players', async (c) => {
  const db = c.env.DB;

  const { results: players } = await db.prepare(`
    SELECT p.name, p.gender, p.seed, p.rating, t.name as team_name, t.short_name
    FROM players p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.tournament_id = 1 ORDER BY t.name, p.name
  `).all();

  const data = [['姓名', '性别', '队伍', '简称', '种子', '积分']];
  players.forEach((p: any) => {
    data.push([p.name, p.gender, p.team_name || '', p.short_name || '', p.seed || '', p.rating || '']);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, '选手名单');

  const outBuf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  return new Response(outBuf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="players.xlsx"'
    }
  });
});

export { app as exportApi };
