import type { FC } from 'hono/jsx';

type Match = {
  table_no: number;
  p1: string;
  p2: string;
  score1: number;
  score2: number;
  event: string;
  status: string;
};

export const BigScreenPage: FC<{ title: string; matches: Match[]; tables: number }> = ({ title, matches, tables }) => {
  const byTable: Record<number, Match | null> = {};
  for (let i = 1; i <= tables; i++) byTable[i] = null;
  for (const m of matches) if (m.status === 'playing') byTable[m.table_no] = m;

  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>实时大屏 - {title}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; font-family: system-ui, sans-serif; color: white; }
          .header { text-align: center; padding: 30px; background: rgba(0,0,0,0.3); }
          .header h1 { font-size: 2.5rem; font-weight: bold; }
          .header .time { font-size: 1.2rem; opacity: 0.7; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; padding: 30px; }
          .table-card { background: rgba(255,255,255,0.1); border-radius: 20px; padding: 25px; backdrop-filter: blur(10px); }
          .table-card.active { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); animation: pulse 2s infinite; }
          .table-card.idle { opacity: 0.5; }
          .table-no { font-size: 1.5rem; font-weight: bold; margin-bottom: 15px; }
          .event { font-size: 0.9rem; opacity: 0.8; margin-bottom: 10px; }
          .player { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
          .player:last-child { border-bottom: none; }
          .player-name { font-size: 1.8rem; font-weight: 500; }
          .player-score { font-size: 3rem; font-weight: bold; }
          .idle-text { text-align: center; padding: 40px; opacity: 0.5; font-size: 1.2rem; }
          @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(231,76,60,0.4); } 50% { box-shadow: 0 0 30px 10px rgba(231,76,60,0.2); } }
        `}} />
      </head>
      <body>
        <div class="header">
          <h1>🏓 {title}</h1>
          <div class="time" id="clock"></div>
        </div>
        <div class="grid">
          {Array.from({ length: tables }, (_, i) => {
            const t = i + 1;
            const m = byTable[t];
            return (
              <div class={`table-card ${m ? 'active' : 'idle'}`}>
                <div class="table-no">{t} 号台</div>
                {m ? (
                  <>
                    <div class="event">{m.event}</div>
                    <div class="player">
                      <span class="player-name">{m.p1}</span>
                      <span class="player-score">{m.score1}</span>
                    </div>
                    <div class="player">
                      <span class="player-name">{m.p2}</span>
                      <span class="player-score">{m.score2}</span>
                    </div>
                  </>
                ) : (
                  <div class="idle-text">暂无比赛</div>
                )}
              </div>
            );
          })}
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          function updateClock() {
            document.getElementById('clock').textContent = new Date().toLocaleString('zh-CN');
          }
          updateClock();
          setInterval(updateClock, 1000);
          setInterval(function() { location.reload(); }, 15000);
        `}} />
      </body>
    </html>
  );
};


// Legacy exports for compatibility
export const BigScreenLive: FC<{ matches: any; checkin: any }> = ({ matches }) => (
  <BigScreenPage title="实时比分" matches={matches} tables={6} />
);
export const BigScreenResults: FC = () => <div>Results</div>;
export const BigScreenSchedule: FC = () => <div>Schedule</div>;
