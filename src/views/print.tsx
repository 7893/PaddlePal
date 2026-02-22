import type { FC } from 'hono/jsx';

type Match = {
  id: number;
  time: string;
  table_no: number;
  event: string;
  p1: string;
  p2: string;
  score1: number;
  score2: number;
  games: string;
};

export const PrintScoresheet: FC<{ matches: Match[]; title: string }> = ({ matches, title }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>记录表 - {title}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 10mm; }
        body { font-family: "Microsoft YaHei", sans-serif; }
        .sheet { border: 2px solid #000; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
        .header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
        .title { font-size: 16px; font-weight: bold; }
        .meta { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background: #f0f0f0; }
        .player { text-align: left; font-weight: bold; width: 100px; }
        .sign { margin-top: 15px; display: flex; justify-content: space-between; font-size: 12px; }
        @media print { .no-print { display: none; } }
      `}} />
    </head>
    <body>
      <div class="no-print" style="padding:10px;background:#f0f0f0;margin-bottom:20px;">
        <button onclick="window.print()" style="padding:10px 20px;font-size:16px;">🖨️ 打印</button>
        <a href="/admin" style="margin-left:20px;">返回管理</a>
      </div>
      {matches.map(m => (
        <div class="sheet">
          <div class="header">
            <div class="title">{m.event}</div>
            <div class="meta">场序: {m.id} | 时间: {m.time} | {m.table_no}号台</div>
          </div>
          <table>
            <tr>
              <th class="player">选手</th>
              <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th>
              <th>总分</th>
            </tr>
            <tr>
              <td class="player">{m.p1}</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td>
            </tr>
            <tr>
              <td class="player">{m.p2}</td>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td>
            </tr>
          </table>
          <div class="sign">
            <span>裁判员: ____________</span>
            <span>记录员: ____________</span>
            <span>日期: ____________</span>
          </div>
        </div>
      ))}
    </body>
  </html>
);

export const PrintResults: FC<{ matches: Match[]; title: string }> = ({ matches, title }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>成绩单 - {title}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 15mm; }
        body { font-family: "Microsoft YaHei", sans-serif; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
        th { background: #f0f0f0; }
        .winner { font-weight: bold; color: #27ae60; }
        @media print { .no-print { display: none; } }
      `}} />
    </head>
    <body>
      <div class="no-print" style="padding:10px;background:#f0f0f0;margin-bottom:20px;">
        <button onclick="window.print()" style="padding:10px 20px;font-size:16px;">🖨️ 打印</button>
        <a href="/admin" style="margin-left:20px;">返回管理</a>
      </div>
      <h1>🏓 {title} - 比赛成绩</h1>
      <table>
        <tr>
          <th>场序</th><th>时间</th><th>球台</th><th>项目</th>
          <th>选手A</th><th>比分</th><th>选手B</th><th>局分</th>
        </tr>
        {matches.map(m => (
          <tr>
            <td>{m.id}</td>
            <td>{m.time}</td>
            <td>{m.table_no}</td>
            <td>{m.event}</td>
            <td class={m.score1 > m.score2 ? 'winner' : ''}>{m.p1}</td>
            <td style="text-align:center">{m.score1} : {m.score2}</td>
            <td class={m.score2 > m.score1 ? 'winner' : ''}>{m.p2}</td>
            <td style="font-size:10px">{m.games}</td>
          </tr>
        ))}
      </table>
    </body>
  </html>
);

export const PrintSchedule: FC<{ matches: Match[]; title: string }> = ({ matches, title }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>赛程表 - {title}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: "Microsoft YaHei", sans-serif; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 4px 6px; font-size: 11px; }
        th { background: #f0f0f0; }
        @media print { .no-print { display: none; } }
      `}} />
    </head>
    <body>
      <div class="no-print" style="padding:10px;background:#f0f0f0;margin-bottom:20px;">
        <button onclick="window.print()" style="padding:10px 20px;font-size:16px;">🖨️ 打印</button>
        <a href="/admin" style="margin-left:20px;">返回管理</a>
      </div>
      <h1>📅 {title} - 赛程安排</h1>
      <table>
        <tr>
          <th>场序</th><th>时间</th><th>球台</th><th>项目</th><th>对阵</th><th>状态</th>
        </tr>
        {matches.map(m => (
          <tr>
            <td>{m.id}</td>
            <td>{m.time}</td>
            <td>{m.table_no}号</td>
            <td>{m.event}</td>
            <td>{m.p1} vs {m.p2}</td>
            <td>{m.score1 !== undefined ? `${m.score1}:${m.score2}` : '待赛'}</td>
          </tr>
        ))}
      </table>
    </body>
  </html>
);
