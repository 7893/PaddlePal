import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type Match = {
  id: number;
  table_no: number;
  time: string;
  p1: string;
  p2: string;
  score1: number;
  score2: number;
  status: string;
  event_title: string;
};

export const ControlPanelPage: FC<{ tables: number; matches: Match[] }> = ({ tables, matches }) => {
  // 按球台分组
  const byTable: Record<number, Match[]> = {};
  for (let i = 1; i <= tables; i++) byTable[i] = [];
  for (const m of matches) {
    if (byTable[m.table_no]) byTable[m.table_no].push(m);
  }

  return (
    <Layout title="控场面板">
      <Nav current="/admin" />
      <div class="max-w-7xl mx-auto px-4 py-6 fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">🎮 控场面板</h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500" id="lastUpdate">--</span>
            <button onclick="refresh()" class="px-3 py-1.5 text-sm bg-pp-600 text-white rounded-lg hover:bg-pp-700">刷新</button>
          </div>
        </div>

        {/* 球台网格 */}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="tableGrid">
          {Array.from({ length: tables }, (_, i) => {
            const tableNo = i + 1;
            const tableMatches = byTable[tableNo] || [];
            const current = tableMatches.find(m => m.status === 'playing');
            const next = tableMatches.find(m => m.status === 'scheduled');

            return (
              <div class={`rounded-xl border-2 p-4 ${current ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} data-table={tableNo}>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-lg font-bold text-gray-700">{tableNo}号台</span>
                  {current ? (
                    <span class="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">比赛中</span>
                  ) : (
                    <span class="px-2 py-0.5 text-xs bg-gray-300 text-gray-600 rounded-full">空闲</span>
                  )}
                </div>

                {current ? (
                  <div class="space-y-2">
                    <div class="text-xs text-gray-500">{current.event_title}</div>
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-800 truncate flex-1">{current.p1}</span>
                      <span class="text-xl font-bold text-red-600 mx-2">{current.score1}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-800 truncate flex-1">{current.p2}</span>
                      <span class="text-xl font-bold text-red-600 mx-2">{current.score2}</span>
                    </div>
                    <div class="pt-2 flex gap-2">
                      <a href={`/score/${current.id}`} class="flex-1 text-center py-1.5 text-xs bg-pp-600 text-white rounded-lg hover:bg-pp-700">录入</a>
                      <button onclick={`reassign(${current.id})`} class="flex-1 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">换台</button>
                    </div>
                  </div>
                ) : next ? (
                  <div class="space-y-2">
                    <div class="text-xs text-gray-500">下一场 {next.time}</div>
                    <div class="text-sm text-gray-700 truncate">{next.p1}</div>
                    <div class="text-sm text-gray-700 truncate">vs {next.p2}</div>
                    <button onclick={`startMatch(${next.id})`} class="w-full mt-2 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">开始比赛</button>
                  </div>
                ) : (
                  <div class="text-center py-4 text-gray-400 text-sm">暂无比赛</div>
                )}
              </div>
            );
          })}
        </div>

        {/* 待比赛列表 */}
        <div class="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 class="font-medium text-gray-700 mb-3">📋 待比赛队列</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto" id="queue">
            {matches.filter(m => m.status === 'scheduled').slice(0, 10).map(m => (
              <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                <span class="text-gray-500">{m.time}</span>
                <span class="text-gray-700">{m.p1} vs {m.p2}</span>
                <span class="text-gray-400">{m.table_no}号台</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
function refresh() {
  location.reload();
}

function startMatch(matchId) {
  fetch('/api/control/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId: matchId })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) location.reload();
    else alert('错误: ' + res.error);
  });
}

function reassign(matchId) {
  var newTable = prompt('输入新球台号:');
  if (!newTable) return;

  fetch('/api/control/reassign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId: matchId, tableNo: parseInt(newTable) })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) location.reload();
    else alert('错误: ' + res.error);
  });
}

document.getElementById('lastUpdate').textContent = '更新: ' + new Date().toLocaleTimeString();

// Auto refresh every 30s
setInterval(refresh, 30000);
`}} />
    </Layout>
  );
};
