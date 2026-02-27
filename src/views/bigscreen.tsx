import type { FC } from 'hono/jsx';

type Match = {
  table_no: number; p1: string; p2: string;
  score1: number; score2: number; event: string; status: string;
};

export const BigScreenPage: FC<{ title: string; matches: Match[]; tables: number }> = ({ title, matches, tables }) => {
  const byTable: Record<number, Match | null> = {};
  for (let i = 1; i <= tables; i++) byTable[i] = null;
  for (const m of matches) if (m.status === 'playing') byTable[m.table_no] = m;
  const playing = matches.filter(m => m.status === 'playing').length;

  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>实时大屏 - {title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%); 
            min-height: 100vh; 
            font-family: 'Inter', system-ui, sans-serif; 
            color: white;
            overflow-x: hidden;
          }
          .bg-pattern {
            position: fixed; inset: 0; opacity: 0.1;
            background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0);
            background-size: 40px 40px;
            pointer-events: none;
          }
          .glow-1 { position: fixed; top: 20%; left: 20%; width: 400px; height: 400px; background: rgba(16,185,129,0.2); border-radius: 50%; filter: blur(100px); }
          .glow-2 { position: fixed; bottom: 20%; right: 20%; width: 400px; height: 400px; background: rgba(20,184,166,0.2); border-radius: 50%; filter: blur(100px); }
          
          .header { 
            text-align: center; padding: 40px 30px; 
            background: rgba(0,0,0,0.3); backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            position: relative; z-index: 10;
          }
          .logo { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px; }
          .logo-icon { width: 60px; height: 60px; background: linear-gradient(135deg, #34d399, #14b8a6); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 10px 40px rgba(16,185,129,0.3); }
          .header h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em; }
          .header-stats { display: flex; justify-content: center; gap: 40px; margin-top: 20px; }
          .stat { text-align: center; }
          .stat-value { font-size: 2rem; font-weight: 700; color: #34d399; }
          .stat-label { font-size: 0.9rem; opacity: 0.6; margin-top: 5px; }
          .time { font-size: 1.1rem; opacity: 0.5; margin-top: 15px; }
          
          .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); 
            gap: 25px; 
            padding: 40px; 
            position: relative; z-index: 10;
          }
          
          .table-card { 
            background: rgba(255,255,255,0.05); 
            border-radius: 24px; 
            padding: 30px; 
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
          }
          .table-card.active { 
            background: linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(185,28,28,0.9) 100%); 
            border-color: rgba(255,255,255,0.2);
            box-shadow: 0 20px 60px rgba(239,68,68,0.3);
          }
          .table-card.idle { opacity: 0.4; }
          
          .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .table-no { font-size: 1.6rem; font-weight: 700; }
          .table-status { padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
          .table-status.live { background: rgba(255,255,255,0.2); animation: pulse 2s infinite; }
          .table-status.idle { background: rgba(255,255,255,0.1); }
          
          .event { font-size: 0.95rem; opacity: 0.8; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.15); }
          
          .player { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
          .player:first-of-type { border-bottom: 1px solid rgba(255,255,255,0.1); }
          .player-name { font-size: 1.8rem; font-weight: 600; letter-spacing: -0.01em; }
          .player-score { font-size: 4rem; font-weight: 800; line-height: 1; }
          .player.winning .player-score { color: #fbbf24; }
          
          .idle-content { text-align: center; padding: 50px 20px; }
          .idle-icon { font-size: 3rem; opacity: 0.3; margin-bottom: 15px; }
          .idle-text { font-size: 1.1rem; opacity: 0.5; }
          
          @keyframes pulse { 
            0%, 100% { opacity: 1; } 
            50% { opacity: 0.7; } 
          }
        `}} />
      </head>
      <body>
        <div class="bg-pattern"></div>
        <div class="glow-1"></div>
        <div class="glow-2"></div>
        
        <div class="header">
          <div class="logo">
            <div class="logo-icon">🏓</div>
            <h1>{title}</h1>
          </div>
          <div class="header-stats">
            <div class="stat">
              <div class="stat-value">{playing}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat">
              <div class="stat-value">{tables}</div>
              <div class="stat-label">球台</div>
            </div>
          </div>
          <div class="time" id="clock"></div>
        </div>
        
        <div class="grid">
          {Array.from({ length: tables }, (_, i) => {
            const t = i + 1;
            const m = byTable[t];
            const p1Winning = m && m.score1 > m.score2;
            const p2Winning = m && m.score2 > m.score1;
            return (
              <div class={`table-card ${m ? 'active' : 'idle'}`}>
                <div class="table-header">
                  <div class="table-no">{t} 号台</div>
                  <div class={`table-status ${m ? 'live' : 'idle'}`}>{m ? '● 比赛中' : '空闲'}</div>
                </div>
                {m ? (
                  <>
                    <div class="event">{m.event}</div>
                    <div class={`player ${p1Winning ? 'winning' : ''}`}>
                      <span class="player-name">{m.p1}</span>
                      <span class="player-score">{m.score1}</span>
                    </div>
                    <div class={`player ${p2Winning ? 'winning' : ''}`}>
                      <span class="player-name">{m.p2}</span>
                      <span class="player-score">{m.score2}</span>
                    </div>
                  </>
                ) : (
                  <div class="idle-content">
                    <div class="idle-icon">🏓</div>
                    <div class="idle-text">暂无比赛</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <script dangerouslySetInnerHTML={{ __html: `
          function updateClock() {
            document.getElementById('clock').textContent = new Date().toLocaleString('zh-CN', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
          }
          updateClock();
          setInterval(updateClock, 1000);
          setInterval(function() { location.reload(); }, 15000);
        `}} />
      </body>
    </html>
  );
};

export const BigScreenLive: FC<{ matches: Match[]; checkin: unknown }> = ({ matches }) => (
  <BigScreenPage title="实时比分" matches={matches} tables={6} />
);
export const BigScreenResults: FC = () => <div>Results</div>;
export const BigScreenSchedule: FC = () => <div>Schedule</div>;
