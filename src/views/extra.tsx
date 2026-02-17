// Ranking page
export const RankingPage = ({ players }: { players: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>积分排名</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
      <style>{`
        body { max-width: 900px; }
        table { width: 100%; }
        .rank { font-weight: bold; color: #666; }
        .rank-1 { color: gold; font-size: 1.2em; }
        .rank-2 { color: silver; }
        .rank-3 { color: #cd7f32; }
        .rating { font-weight: bold; color: #0066cc; }
        a { text-decoration: none; }
      `}</style>
    </head>
    <body>
      <h1>🏆 积分排名</h1>
      <p><a href="/">← 返回首页</a></p>
      <table>
        <thead><tr><th>排名</th><th>姓名</th><th>队伍</th><th>积分</th></tr></thead>
        <tbody>
          {players.map((p: any, i: number) => (
            <tr>
              <td class={`rank rank-${i + 1}`}>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.team || '-'}</td>
              <td class="rating">{p.rating}</td>
            </tr>
          ))}
          {players.length === 0 && <tr><td colspan="4">暂无数据</td></tr>}
        </tbody>
      </table>
    </body>
  </html>
);

// Notices page
export const NoticesPage = ({ notices }: { notices: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>公告通知</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
      <style>{`
        body { max-width: 900px; }
        .notice { border-left: 4px solid #0066cc; padding: 15px; margin: 15px 0; background: #f5f5f5; }
        .notice-title { font-weight: bold; font-size: 1.1em; margin-bottom: 8px; }
        .notice-time { color: #888; font-size: 0.9em; }
        .notice-content { margin-top: 10px; white-space: pre-wrap; }
        a { text-decoration: none; }
      `}</style>
    </head>
    <body>
      <h1>📢 公告通知</h1>
      <p><a href="/">← 返回首页</a></p>
      {notices.map((n: any) => (
        <div class="notice">
          <div class="notice-title">{n.title || '公告'}</div>
          <div class="notice-time">{n.created_at || ''}</div>
          <div class="notice-content">{n.content}</div>
        </div>
      ))}
      {notices.length === 0 && <p>暂无公告</p>}
    </body>
  </html>
);

// Progress page
export const ProgressPage = ({ events }: { events: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>赛程进度</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
      <style>{`
        body { max-width: 900px; }
        .event { margin: 20px 0; }
        .event-title { font-weight: bold; margin-bottom: 8px; }
        .progress-bar { background: #e0e0e0; border-radius: 10px; height: 24px; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; }
        .stats { color: #666; font-size: 0.9em; margin-top: 5px; }
        a { text-decoration: none; }
      `}</style>
    </head>
    <body>
      <h1>📊 赛程进度</h1>
      <p><a href="/">← 返回首页</a></p>
      {events.map((e: any) => {
        const pct = e.total > 0 ? Math.floor(e.finished * 100 / e.total) : 0;
        return (
          <div class="event">
            <div class="event-title">{e.title} ({e.key})</div>
            <div class="progress-bar">
              <div class="progress-fill" style={`width: ${pct}%`}>{pct > 10 ? `${pct}%` : ''}</div>
            </div>
            <div class="stats">已完成 {e.finished} / {e.total} 场 ({pct}%)</div>
          </div>
        );
      })}
      {events.length === 0 && <p>暂无项目</p>}
    </body>
  </html>
);
