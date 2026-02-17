// Big screen display pages
export const BigScreenLive = ({ matches, checkin }: { matches: any[], checkin: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>实时比分 - 大屏</title>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', sans-serif; background: #1a1a2e; color: #fff; }
        .container { display: flex; height: 100vh; }
        .panel { flex: 1; padding: 20px; overflow: hidden; }
        .panel-left { border-right: 2px solid #444; }
        h2 { text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-bottom: 20px; border-radius: 8px; font-size: 24px; }
        .panel-right h2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 8px; text-align: center; border-bottom: 1px solid #333; }
        th { background: #2d2d44; font-size: 16px; }
        td { font-size: 18px; }
        tr:hover { background: #2d2d44; }
        .score { font-weight: bold; font-size: 20px; color: #ffd700; }
        .table-no { background: #4a4a6a; border-radius: 4px; padding: 4px 8px; }
        .vs { color: #888; }
        .player { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => location.reload(), 10000);` }} />
    </head>
    <body>
      <div class="container">
        <div class="panel panel-left">
          <h2>🏓 比赛中</h2>
          <table>
            <thead><tr><th>台号</th><th>项目</th><th>选手</th><th>比分</th><th>选手</th></tr></thead>
            <tbody>
              {matches.map((m: any) => (
                <tr>
                  <td><span class="table-no">{m.tb}</span></td>
                  <td>{m.gp}</td>
                  <td class="player">{m.nl || m.tnl}</td>
                  <td class="score">{m.score || '0:0'}</td>
                  <td class="player">{m.nr || m.tnr}</td>
                </tr>
              ))}
              {matches.length === 0 && <tr><td colspan="5">暂无比赛</td></tr>}
            </tbody>
          </table>
        </div>
        <div class="panel panel-right">
          <h2>📋 检录中</h2>
          <table>
            <thead><tr><th>台号</th><th>项目</th><th>选手</th><th class="vs">VS</th><th>选手</th></tr></thead>
            <tbody>
              {checkin.map((m: any) => (
                <tr>
                  <td><span class="table-no">{m.tb}</span></td>
                  <td>{m.gp}</td>
                  <td class="player">{m.nl || m.tnl}</td>
                  <td class="vs">VS</td>
                  <td class="player">{m.nr || m.tnr}</td>
                </tr>
              ))}
              {checkin.length === 0 && <tr><td colspan="5">暂无检录</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </body>
  </html>
);

export const BigScreenResults = ({ event, results }: { event: string, results: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>成绩公告 - 大屏</title>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', sans-serif; background: #0f0f23; color: #fff; min-height: 100vh; padding: 30px; }
        h1 { text-align: center; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); margin-bottom: 30px; border-radius: 10px; font-size: 32px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .card { background: #1e1e3f; border-radius: 10px; padding: 20px; }
        .match-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: #888; font-size: 14px; }
        .players { display: flex; justify-content: space-between; align-items: center; font-size: 20px; }
        .player { flex: 1; }
        .player.right { text-align: right; }
        .score { font-size: 28px; font-weight: bold; color: #ffd700; padding: 0 20px; }
        .winner { color: #38ef7d; }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => location.reload(), 15000);` }} />
    </head>
    <body>
      <h1>🏆 {event || '成绩公告'}</h1>
      <div class="grid">
        {results.map((m: any) => (
          <div class="card">
            <div class="match-info">
              <span>第{m.round}轮 #{m.order}</span>
              <span>台{m.tb}</span>
            </div>
            <div class="players">
              <div class={`player ${m.winner === 1 ? 'winner' : ''}`}>{m.p1}</div>
              <div class="score">{m.result || '-'}</div>
              <div class={`player right ${m.winner === 2 ? 'winner' : ''}`}>{m.p2}</div>
            </div>
          </div>
        ))}
      </div>
    </body>
  </html>
);

export const BigScreenSchedule = ({ title, matches }: { title: string, matches: any[] }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>赛程表 - 大屏</title>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', sans-serif; background: #16213e; color: #fff; min-height: 100vh; padding: 30px; }
        h1 { text-align: center; padding: 20px; background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); margin-bottom: 30px; border-radius: 10px; font-size: 32px; color: #000; }
        table { width: 100%; border-collapse: collapse; background: #1a1a3e; border-radius: 10px; overflow: hidden; }
        th { background: #2d2d5a; padding: 15px; font-size: 18px; }
        td { padding: 12px; text-align: center; border-bottom: 1px solid #333; font-size: 16px; }
        tr:hover { background: #2d2d5a; }
        .time { color: #feca57; }
        .table-no { background: #4a4a8a; border-radius: 4px; padding: 4px 10px; }
        .status-pending { color: #888; }
        .status-playing { color: #38ef7d; }
        .status-finished { color: #ffd700; }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => location.reload(), 20000);` }} />
    </head>
    <body>
      <h1>📅 {title || '比赛秩序'}</h1>
      <table>
        <thead><tr><th>时间</th><th>台号</th><th>项目</th><th>选手/队伍</th><th>VS</th><th>选手/队伍</th><th>状态</th></tr></thead>
        <tbody>
          {matches.map((m: any) => (
            <tr>
              <td class="time">{m.time || '-'}</td>
              <td><span class="table-no">{m.tb}</span></td>
              <td>{m.event}</td>
              <td>{m.p1}</td>
              <td>VS</td>
              <td>{m.p2}</td>
              <td class={`status-${m.status || 'pending'}`}>{m.status === 'finished' ? '已结束' : m.status === 'playing' ? '进行中' : '待开始'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </body>
  </html>
);
