import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type DrawEntry = {
  position: number;
  seed: number;
  player: string;
  team: string;
  rating: number;
  drawTime: string;
};

type DrawEvent = {
  key: string;
  title: string;
  entries: DrawEntry[];
  status: 'pending' | 'drawing' | 'completed';
  totalPlayers: number;
};

// Draw announcement board - for projection display
export const DrawBoardPage: FC<{ event: DrawEvent; tournament: string }> = ({ event, tournament }) => (
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>抽签公告 - {event.title}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Microsoft YaHei', sans-serif; 
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          min-height: 100vh;
          overflow: hidden;
        }
        .container { padding: 40px; height: 100vh; display: flex; flex-direction: column; }
        .header { text-align: center; margin-bottom: 30px; }
        .tournament { font-size: 24px; color: #64748b; margin-bottom: 10px; }
        .event-title { font-size: 48px; font-weight: bold; background: linear-gradient(90deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .status { margin-top: 15px; }
        .status-badge { display: inline-block; padding: 8px 24px; border-radius: 50px; font-size: 18px; font-weight: 500; }
        .status-pending { background: #374151; color: #9ca3af; }
        .status-drawing { background: #dc2626; color: #fff; animation: pulse 1.5s infinite; }
        .status-completed { background: #059669; color: #fff; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        
        .draw-grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; overflow-y: auto; padding: 10px; }
        .draw-slot { 
          background: rgba(255,255,255,0.05); 
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; 
          padding: 15px;
          transition: all 0.3s ease;
        }
        .draw-slot.filled { 
          background: rgba(16, 185, 129, 0.1); 
          border-color: rgba(16, 185, 129, 0.3);
        }
        .draw-slot.new { 
          animation: slideIn 0.5s ease;
          background: rgba(16, 185, 129, 0.2);
        }
        @keyframes slideIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .slot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .slot-position { font-size: 14px; color: #64748b; }
        .slot-seed { font-size: 12px; padding: 2px 8px; background: #fbbf24; color: #000; border-radius: 4px; font-weight: 600; }
        .slot-player { font-size: 18px; font-weight: 600; color: #fff; }
        .slot-team { font-size: 13px; color: #94a3b8; margin-top: 4px; }
        .slot-empty { color: #4b5563; font-style: italic; }
        
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        .progress { margin-top: 10px; }
        .progress-bar { height: 6px; background: #374151; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.5s ease; }
      `}} />
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="tournament">{tournament}</div>
          <div class="event-title">{event.title} 抽签</div>
          <div class="status">
            <span class={`status-badge status-${event.status}`}>
              {event.status === 'pending' ? '⏳ 等待开始' : event.status === 'drawing' ? '🎲 抽签进行中' : '✅ 抽签完成'}
            </span>
          </div>
        </div>

        <div class="draw-grid" id="drawGrid">
          {Array.from({ length: event.totalPlayers }, (_, i) => {
            const entry = event.entries.find(e => e.position === i + 1);
            return (
              <div class={`draw-slot ${entry ? 'filled' : ''}`} data-position={i + 1}>
                <div class="slot-header">
                  <span class="slot-position">#{i + 1}</span>
                  {entry?.seed && entry.seed <= 8 && <span class="slot-seed">{entry.seed}号种子</span>}
                </div>
                {entry ? (
                  <>
                    <div class="slot-player">{entry.player}</div>
                    <div class="slot-team">{entry.team}</div>
                  </>
                ) : (
                  <div class="slot-player slot-empty">待抽签</div>
                )}
              </div>
            );
          })}
        </div>

        <div class="footer">
          <div>已抽签: {event.entries.length} / {event.totalPlayers}</div>
          <div class="progress">
            <div class="progress-bar">
              <div class="progress-fill" style={`width: ${(event.entries.length / event.totalPlayers) * 100}%`}></div>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
var eventKey = '${event.key}';
var lastCount = ${event.entries.length};

async function pollDraw() {
  try {
    var res = await fetch('/api/draw/' + eventKey + '/status');
    var data = await res.json();
    
    if (data.entries.length > lastCount) {
      // New entry drawn
      var newEntries = data.entries.slice(lastCount);
      newEntries.forEach(function(entry) {
        var slot = document.querySelector('[data-position="' + entry.position + '"]');
        if (slot) {
          slot.classList.add('filled', 'new');
          slot.innerHTML = '<div class="slot-header"><span class="slot-position">#' + entry.position + '</span>' +
            (entry.seed && entry.seed <= 8 ? '<span class="slot-seed">' + entry.seed + '号种子</span>' : '') +
            '</div><div class="slot-player">' + entry.player + '</div><div class="slot-team">' + entry.team + '</div>';
          setTimeout(function() { slot.classList.remove('new'); }, 2000);
        }
      });
      lastCount = data.entries.length;
      
      // Update progress
      document.querySelector('.footer > div').textContent = '已抽签: ' + lastCount + ' / ${event.totalPlayers}';
      document.querySelector('.progress-fill').style.width = (lastCount / ${event.totalPlayers} * 100) + '%';
    }
    
    // Update status
    var statusBadge = document.querySelector('.status-badge');
    statusBadge.className = 'status-badge status-' + data.status;
    statusBadge.textContent = data.status === 'pending' ? '⏳ 等待开始' : data.status === 'drawing' ? '🎲 抽签进行中' : '✅ 抽签完成';
    
  } catch (e) {
    console.error('Poll error:', e);
  }
}

setInterval(pollDraw, 2000);
`}} />
    </body>
  </html>
);

// Draw management page
export const DrawManagePage: FC<{ events: DrawEvent[] }> = ({ events }) => (
  <Layout title="抽签编排">
    <Nav current="/admin/draw" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">🎲 抽签编排</h2>
          <p class="text-sm text-gray-500 mt-1">管理各项目抽签</p>
        </div>
      </div>

      <div class="space-y-4">
        {events.map(ev => (
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-gray-800">{ev.title}</h3>
                <p class="text-sm text-gray-500">{ev.entries.length} / {ev.totalPlayers} 已抽签</p>
              </div>
              <Badge color={ev.status === 'completed' ? 'green' : ev.status === 'drawing' ? 'red' : 'gray'}>
                {ev.status === 'completed' ? '已完成' : ev.status === 'drawing' ? '进行中' : '待开始'}
              </Badge>
            </div>
            
            <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div class="bg-pp-500 h-2 rounded-full transition-all" style={`width: ${(ev.entries.length / ev.totalPlayers) * 100}%`}></div>
            </div>

            <div class="flex gap-2">
              <a href={`/screen/draw/${ev.key}`} target="_blank" class="px-3 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition">
                📺 公告牌
              </a>
              {ev.status === 'pending' && (
                <button onclick={`startDraw('${ev.key}')`} class="px-3 py-2 text-sm bg-pp-600 text-white rounded-lg hover:bg-pp-700 transition">
                  ▶ 开始抽签
                </button>
              )}
              {ev.status === 'drawing' && (
                <>
                  <button onclick={`drawNext('${ev.key}')`} class="px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
                    🎲 抽下一位
                  </button>
                  <button onclick={`autoDraw('${ev.key}')`} class="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                    ⚡ 自动完成
                  </button>
                </>
              )}
              {ev.status === 'completed' && (
                <a href={`/results/${ev.key}`} class="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                  📋 查看签表
                </a>
              )}
              <button onclick={`resetDraw('${ev.key}')`} class="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
                🔄 重置
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
function api(url, body) {
  return fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body||{})}).then(r=>r.json());
}

function startDraw(key) {
  api('/api/draw/' + key + '/start').then(function(res) {
    if (res.success) location.reload();
    else alert('Error: ' + res.error);
  });
}

function drawNext(key) {
  api('/api/draw/' + key + '/next').then(function(res) {
    if (res.success) {
      alert('抽中: ' + res.player + ' → 位置 #' + res.position);
      location.reload();
    } else alert('Error: ' + res.error);
  });
}

function autoDraw(key) {
  if (!confirm('自动完成剩余抽签？')) return;
  api('/api/draw/' + key + '/auto').then(function(res) {
    if (res.success) location.reload();
    else alert('Error: ' + res.error);
  });
}

function resetDraw(key) {
  if (!confirm('确定重置抽签？所有签位将被清空。')) return;
  api('/api/draw/' + key + '/reset').then(function(res) {
    if (res.success) location.reload();
    else alert('Error: ' + res.error);
  });
}
`}} />
  </Layout>
);
