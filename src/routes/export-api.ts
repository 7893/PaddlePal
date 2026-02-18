import { Hono } from 'hono';
import Papa from 'papaparse';

type Bindings = { DB: D1Database; FILES: R2Bucket };
const app = new Hono<{ Bindings: Bindings }>();

// Export players as CSV: GET /api/export/players
app.get('/api/export/players', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT p.id, p.name, p.gender, p.rating, t.name as team, t.short_name
    FROM players p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.tournament_id = 1 ORDER BY t.name, p.name
  `).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="players.csv"',
    },
  });
});

// Export all results: GET /api/export/results
app.get('/api/export/results', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT m.match_order as pid, e.title as event, m.round, m.table_no,
      COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2,
      COALESCE(t1.short_name,'') as team1, COALESCE(t2.short_name,'') as team2,
      m.result, m.status, m.time, m.date
    FROM matches m
    JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE e.tournament_id = 1
    ORDER BY m.match_order
  `).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="results.csv"',
    },
  });
});

// Export schedule: GET /api/export/schedule
app.get('/api/export/schedule', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT m.match_order as pid, m.date, m.time, m.table_no as table_num,
      e.title as event, COALESCE(p1.name,'') as player1, COALESCE(p2.name,'') as player2,
      m.status
    FROM matches m
    JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE e.tournament_id = 1
    ORDER BY m.date, m.time, m.table_no
  `).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="schedule.csv"',
    },
  });
});

// Export ratings: GET /api/export/ratings
app.get('/api/export/ratings', async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT p.name as player, t.short_name as team, e.title as event,
      r.rating_before, r.rating_after, r.rating_change, m.match_order as match_pid
    FROM ratings r
    JOIN players p ON r.player_id = p.id
    JOIN events e ON r.event_id = e.id
    JOIN matches m ON r.match_id = m.id
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY r.id
  `).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ratings.csv"',
    },
  });
});

// Export matches as CSV: GET /api/export/matches/:eventKey
app.get('/api/export/matches/:eventKey', async (c) => {
  const eventKey = c.req.param('eventKey');
  const db = c.env.DB;

  const event = await db.prepare('SELECT id, title FROM events WHERE key = ? AND tournament_id = 1').bind(eventKey).first();
  if (!event) return c.json({ error: 'Event not found' }, 404);

  const { results } = await db.prepare(`
    SELECT m.round, m.match_order as match_no, m.table_no,
      COALESCE(p1.name, t1.short_name) as player1,
      COALESCE(p2.name, t2.short_name) as player2,
      m.result, m.status, m.time
    FROM matches m
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON m.team1_id = t1.id
    LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE m.event_id = ?
    ORDER BY m.round, m.match_order
  `).bind(event.id).all();

  const csv = Papa.unparse(results);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${eventKey}-matches.csv"`,
    },
  });
});

// Generate score sheets: GET /api/export/scoresheet
app.get('/api/export/scoresheet', async (c) => {
  const db = c.env.DB;
  const eventKey = c.req.query('event');
  const style = c.req.query('style') || 'simple';
  const print = c.req.query('print');

  let query = `
    SELECT m.match_order as pid, m.table_no, m.time, m.date,
      COALESCE(p1.name,'TBD') as p1, COALESCE(p2.name,'TBD') as p2,
      COALESCE(t1.short_name,'') as t1, COALESCE(t2.short_name,'') as t2,
      e.title as event, COALESCE(e.best_of,5) as best_of
    FROM matches m
    JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    LEFT JOIN teams t1 ON p1.team_id = t1.id
    LEFT JOIN teams t2 ON p2.team_id = t2.id
    WHERE e.tournament_id = 1 AND m.status = 'scheduled'
  `;
  
  const params: (string | number)[] = [];
  if (eventKey) {
    query += ' AND e.key = ?';
    params.push(eventKey);
  }
  query += ' ORDER BY m.date, m.time, m.table_no LIMIT 50';

  const { results: matches } = await db.prepare(query).bind(...params).all();
  const tournament = await db.prepare('SELECT name, venue, start_date FROM tournaments WHERE id = 1').first();

  // Return HTML for printing
  if (print) {
    const html = generateScoreSheetHTML(matches as ScoreSheetMatch[], style, tournament as Tournament);
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // Return as downloadable HTML file
  const html = generateScoreSheetHTML(matches as ScoreSheetMatch[], style, tournament as Tournament);
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="scoresheets.html"',
    },
  });
});

type ScoreSheetMatch = { pid: number; table_no: number; time: string; date: string; p1: string; p2: string; t1: string; t2: string; event: string; best_of: number };
type Tournament = { name: string; venue: string; start_date: string };

function generateScoreSheetHTML(matches: ScoreSheetMatch[], style: string, t: Tournament): string {
  const sheets = matches.map((m, i) => `
    <div class="sheet ${i < matches.length - 1 ? 'page-break' : ''}">
      <div class="header">
        <div class="title">${t.name || '乒乓球比赛'}</div>
        <div class="subtitle">${t.venue || ''} · ${t.start_date || ''}</div>
      </div>
      <div class="info">
        <span>场次: #${m.pid}</span>
        <span>项目: ${m.event}</span>
        <span>球台: ${m.table_no}号</span>
        <span>时间: ${m.time || ''}</span>
      </div>
      <div class="players">
        <div class="player"><div class="name">${m.p1}</div><div class="team">${m.t1}</div></div>
        <div class="vs">VS</div>
        <div class="player"><div class="name">${m.p2}</div><div class="team">${m.t2}</div></div>
      </div>
      <table class="scores">
        <tr><th>局</th>${Array.from({ length: m.best_of }, (_, j) => `<th>第${j + 1}局</th>`).join('')}<th>局分</th></tr>
        <tr><td class="pname">${m.p1}</td>${Array.from({ length: m.best_of }, () => '<td></td>').join('')}<td></td></tr>
        <tr><td class="pname">${m.p2}</td>${Array.from({ length: m.best_of }, () => '<td></td>').join('')}<td></td></tr>
      </table>
      <div class="result"><div class="box">______ : ______</div></div>
      <div class="signature">
        <span>裁判员: ____________</span>
        <span>选手签名: ____________ / ____________</span>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>记分单</title>
<style>
@page{size:A4;margin:10mm}@media print{.no-print{display:none}.page-break{page-break-after:always}}
body{font-family:'SimSun',serif;font-size:12pt;margin:0;padding:20px}
.no-print{padding:10px;background:#f0f0f0;margin-bottom:20px}
.no-print button{padding:10px 20px;font-size:14pt;margin-right:10px;cursor:pointer}
.sheet{border:1px solid #000;padding:20px;margin-bottom:20px}
.header{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px}
.title{font-size:18pt;font-weight:bold}.subtitle{font-size:10pt;color:#666;margin-top:5px}
.info{display:flex;justify-content:space-between;font-size:10pt;margin-bottom:15px}
.players{display:flex;justify-content:space-between;align-items:center;margin:20px 0}
.player{text-align:center;width:40%}.name{font-size:16pt;font-weight:bold;border-bottom:1px solid #000;padding-bottom:5px}
.team{font-size:10pt;color:#666;margin-top:5px}.vs{font-size:20pt;color:#999}
.scores{width:100%;border-collapse:collapse;margin:20px 0}
.scores th,.scores td{border:1px solid #000;padding:10px;text-align:center;height:35px}
.scores th{background:#f5f5f5}.pname{text-align:left;font-weight:bold}
.result{text-align:center;margin:20px 0}.box{display:inline-block;border:2px solid #000;padding:15px 40px;font-size:20pt;font-weight:bold}
.signature{display:flex;justify-content:space-between;font-size:10pt;margin-top:20px}
</style></head><body>
<div class="no-print"><button onclick="window.print()">🖨️ 打印</button><button onclick="window.close()">关闭</button></div>
${sheets}
</body></html>`;
}

export { app as exportApi };
