import { Hono } from 'hono';

type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();

// 秩序册 HTML (可打印)
app.get('/api/export/program', async (c) => {
  const db = c.env.DB;

  const tournament = await db
    .prepare('SELECT title, venue, start_date, end_date FROM tournaments WHERE id = 1')
    .first();
  const { results: events } = await db
    .prepare('SELECT id, title, type, best_of FROM events WHERE tournament_id = 1')
    .all();
  const { results: teams } = await db.prepare('SELECT id, name FROM teams WHERE tournament_id = 1 ORDER BY name').all();
  const { results: players } = await db
    .prepare(
      `
    SELECT p.name, p.gender, t.name as team FROM players p
    LEFT JOIN teams t ON p.team_id = t.id WHERE p.tournament_id = 1 ORDER BY t.name, p.name
  `
    )
    .all();
  const { results: schedule } = await db
    .prepare(
      `
    SELECT m.time, m.table_no, e.title as event,
      COALESCE(p1.name,'TBD') as p1, COALESCE(p2.name,'TBD') as p2
    FROM matches m
    LEFT JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE m.status = 'scheduled'
    ORDER BY m.time, m.table_no
  `
    )
    .all();

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>秩序册 - ${tournament?.title}</title>
<style>
  body { font-family: "Microsoft YaHei", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { text-align: center; color: #333; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; }
  h2 { color: #e74c3c; margin-top: 30px; border-left: 4px solid #e74c3c; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  .info { background: #fef9e7; padding: 15px; border-radius: 5px; margin: 20px 0; }
  .info p { margin: 5px 0; }
  @media print { body { padding: 0; } h2 { page-break-before: auto; } }
</style>
</head><body>
<h1>🏓 ${tournament?.title}</h1>
<div class="info">
  <p><strong>比赛场馆：</strong>${tournament?.venue || '待定'}</p>
  <p><strong>比赛日期：</strong>${tournament?.start_date || ''} ~ ${tournament?.end_date || ''}</p>
  <p><strong>参赛队伍：</strong>${teams.length} 支</p>
  <p><strong>参赛选手：</strong>${players.length} 人</p>
</div>

<h2>一、比赛项目</h2>
<table>
  <tr><th>项目名称</th><th>类型</th><th>局制</th></tr>
  ${events.map((e) => `<tr><td>${e.title}</td><td>${e.type}</td><td>${e.best_of}局${Math.ceil((e.best_of as number) / 2)}胜</td></tr>`).join('')}
</table>

<h2>二、参赛队伍</h2>
<table>
  <tr><th>序号</th><th>队伍名称</th><th>人数</th></tr>
  ${teams
    .map((t, i) => {
      const count = players.filter((p) => p.team === t.name).length;
      return `<tr><td>${i + 1}</td><td>${t.name}</td><td>${count}</td></tr>`;
    })
    .join('')}
</table>

<h2>三、参赛选手</h2>
<table>
  <tr><th>姓名</th><th>队伍</th></tr>
  ${players.map((p) => `<tr><td>${p.name}</td><td>${p.team || '-'}</td></tr>`).join('')}
</table>

<h2>四、比赛日程</h2>
<table>
  <tr><th>时间</th><th>球台</th><th>项目</th><th>对阵</th></tr>
  ${schedule.map((s) => `<tr><td>${s.time}</td><td>${s.table_no}号</td><td>${s.event}</td><td>${s.p1} vs ${s.p2}</td></tr>`).join('')}
</table>

<p style="text-align:center;color:#999;margin-top:40px;">— 秩序册完 —</p>
</body></html>`;

  return c.html(html);
});

// 成绩册 HTML
app.get('/api/export/results-book', async (c) => {
  const db = c.env.DB;

  const tournament = await db.prepare('SELECT title FROM tournaments WHERE id = 1').first();
  const { results: events } = await db.prepare('SELECT id, title FROM events WHERE tournament_id = 1').all();

  let resultsHtml = '';
  for (const event of events) {
    const { results: matches } = await db
      .prepare(
        `
      SELECT m.round, m.time, m.table_no,
        COALESCE(p1.name,'TBD') as p1, COALESCE(p2.name,'TBD') as p2,
        m.score1, m.score2, m.games
      FROM matches m
      LEFT JOIN players p1 ON m.player1_id = p1.id
      LEFT JOIN players p2 ON m.player2_id = p2.id
      WHERE m.event_id = ? AND m.status = 'finished'
      ORDER BY m.round, m.match_order
    `
      )
      .bind(event.id)
      .all();

    if (matches.length === 0) continue;

    resultsHtml += `<h2>${event.title}</h2><table>
      <tr><th>轮次</th><th>选手A</th><th>比分</th><th>选手B</th><th>局分</th></tr>
      ${matches
        .map(
          (m) => `<tr>
        <td>第${m.round}轮</td>
        <td style="${(m.score1 as number) > (m.score2 as number) ? 'font-weight:bold;color:#27ae60' : ''}">${m.p1}</td>
        <td style="text-align:center">${m.score1} : ${m.score2}</td>
        <td style="${(m.score2 as number) > (m.score1 as number) ? 'font-weight:bold;color:#27ae60' : ''}">${m.p2}</td>
        <td style="font-size:12px;color:#666">${m.games || ''}</td>
      </tr>`
        )
        .join('')}
    </table>`;
  }

  // 排名统计
  const { results: rankings } = await db
    .prepare(
      `
    SELECT p.name, t.name as team,
      SUM(CASE WHEN m.score1 > m.score2 AND m.player1_id = p.id THEN 1
               WHEN m.score2 > m.score1 AND m.player2_id = p.id THEN 1 ELSE 0 END) as wins,
      COUNT(CASE WHEN m.player1_id = p.id OR m.player2_id = p.id THEN 1 END) as played
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    LEFT JOIN matches m ON (m.player1_id = p.id OR m.player2_id = p.id) AND m.status = 'finished'
    WHERE p.tournament_id = 1
    GROUP BY p.id
    HAVING played > 0
    ORDER BY wins DESC, played ASC
    LIMIT 20
  `
    )
    .all();

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>成绩册 - ${tournament?.title}</title>
<style>
  body { font-family: "Microsoft YaHei", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { text-align: center; color: #333; border-bottom: 2px solid #27ae60; padding-bottom: 10px; }
  h2 { color: #27ae60; margin-top: 30px; border-left: 4px solid #27ae60; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  @media print { h2 { page-break-before: auto; } }
</style>
</head><body>
<h1>🏆 ${tournament?.title} 成绩册</h1>

<h2>选手战绩排名</h2>
<table>
  <tr><th>排名</th><th>选手</th><th>队伍</th><th>胜场</th><th>场次</th><th>胜率</th></tr>
  ${rankings
    .map((r, i) => {
      const rate = (r.played as number) > 0 ? Math.round(((r.wins as number) / (r.played as number)) * 100) : 0;
      return `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.team || '-'}</td><td>${r.wins}</td><td>${r.played}</td><td>${rate}%</td></tr>`;
    })
    .join('')}
</table>

${resultsHtml}

<p style="text-align:center;color:#999;margin-top:40px;">— 成绩册完 —</p>
</body></html>`;

  return c.html(html);
});

// 记录表 HTML (批量打印)
app.get('/api/export/scoresheets', async (c) => {
  const db = c.env.DB;
  const eventId = c.req.query('event');

  let whereClause = "m.status = 'scheduled'";
  if (eventId) whereClause += ` AND m.event_id = ${eventId}`;

  const { results: matches } = await db
    .prepare(
      `
    SELECT m.id, m.match_order, m.time, m.table_no, e.title as event, e.best_of,
      COALESCE(p1.name,'') as p1, COALESCE(p2.name,'') as p2
    FROM matches m
    LEFT JOIN events e ON m.event_id = e.id
    LEFT JOIN players p1 ON m.player1_id = p1.id
    LEFT JOIN players p2 ON m.player2_id = p2.id
    WHERE ${whereClause}
    ORDER BY m.time, m.table_no
    LIMIT 50
  `
    )
    .all();

  const sheets = matches
    .map((m) => {
      const bestOf = (m.best_of as number) || 5;
      const gameHeaders = Array.from({ length: bestOf }, (_, i) => `<th>第${i + 1}局</th>`).join('');
      const gameRows = Array.from({ length: bestOf }, () => '<td style="height:30px"></td>').join('');

      return `
    <div class="sheet">
      <div class="header">
        <div class="event">${m.event}</div>
        <div class="meta">场序: ${m.match_order} | 时间: ${m.time} | 球台: ${m.table_no}号</div>
      </div>
      <table>
        <tr><th style="width:120px">选手</th>${gameHeaders}<th>总分</th></tr>
        <tr><td class="player">${m.p1 || '________'}</td>${gameRows}<td></td></tr>
        <tr><td class="player">${m.p2 || '________'}</td>${gameRows}<td></td></tr>
      </table>
      <div class="footer">
        <span>裁判员签名: ____________</span>
        <span>记录员签名: ____________</span>
      </div>
    </div>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>比赛记录表</title>
<style>
  body { font-family: "Microsoft YaHei", sans-serif; padding: 10px; }
  .sheet { border: 2px solid #333; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
  .header { margin-bottom: 10px; }
  .event { font-size: 18px; font-weight: bold; }
  .meta { font-size: 12px; color: #666; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #333; padding: 8px; text-align: center; }
  th { background: #f0f0f0; }
  .player { text-align: left; font-weight: bold; }
  .footer { margin-top: 15px; display: flex; justify-content: space-between; font-size: 12px; }
  @media print { .sheet { page-break-after: always; } .sheet:last-child { page-break-after: auto; } }
</style>
</head><body>
${sheets}
</body></html>`;

  return c.html(html);
});

// CSV 导出
app.get('/api/export/csv/:type', async (c) => {
  const db = c.env.DB;
  const type = c.req.param('type');

  let csv = '';
  if (type === 'players') {
    const { results } = await db
      .prepare(
        `
      SELECT p.name, p.gender, t.name as team, p.rating
      FROM players p LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.tournament_id = 1 ORDER BY t.name, p.name
    `
      )
      .all();
    csv =
      '姓名,性别,队伍,积分\n' +
      results.map((r) => `${r.name},${r.gender},${r.team || ''},${r.rating || ''}`).join('\n');
  } else if (type === 'results') {
    const { results } = await db
      .prepare(
        `
      SELECT e.title as event, m.round, p1.name as player1, p2.name as player2, m.score1, m.score2, m.games
      FROM matches m
      LEFT JOIN events e ON m.event_id = e.id
      LEFT JOIN players p1 ON m.player1_id = p1.id
      LEFT JOIN players p2 ON m.player2_id = p2.id
      WHERE m.status = 'finished'
      ORDER BY e.title, m.round, m.match_order
    `
      )
      .all();
    csv =
      '项目,轮次,选手A,选手B,比分A,比分B,局分\n' +
      results
        .map((r) => `${r.event},${r.round},${r.player1},${r.player2},${r.score1},${r.score2},${r.games || ''}`)
        .join('\n');
  }

  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', `attachment; filename="${type}.csv"`);
  return c.body('\ufeff' + csv); // BOM for Excel
});

export { app as exportApi };
