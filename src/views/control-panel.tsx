import type { FC } from 'hono/jsx';
import { Layout, Nav, Footer } from '../components/layout';

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
  const byTable: Record<number, Match[]> = {};
  for (let i = 1; i <= tables; i++) byTable[i] = [];
  for (const m of matches) if (byTable[m.table_no]) byTable[m.table_no].push(m);

  const playing = matches.filter((m) => m.status === 'playing').length;
  const scheduled = matches.filter((m) => m.status === 'scheduled').length;

  return (
    <Layout title="控场面板">
      <Nav current="/admin/control" title="控场面板" />
      <div class="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{tables}</div>
            <div class="text-sm text-slate-500 mt-1">球台总数</div>
          </div>
          <div class="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-red-500/25">
            <div class="text-3xl font-bold">{playing}</div>
            <div class="text-sm text-red-100 mt-1">进行中</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{scheduled}</div>
            <div class="text-sm text-slate-500 mt-1">待比赛</div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-slate-800">球台状态</h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-400" id="lastUpdate">
              --
            </span>
            <button
              onclick="refresh()"
              class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25"
            >
              刷新
            </button>
          </div>
        </div>

        {/* Table grid */}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" id="tableGrid">
          {Array.from({ length: tables }, (_, i) => {
            const tableNo = i + 1;
            const tableMatches = byTable[tableNo] || [];
            const current = tableMatches.find((m) => m.status === 'playing');
            const next = tableMatches.find((m) => m.status === 'scheduled');

            return (
              <div
                class={`rounded-2xl border-2 p-5 transition-all ${current ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg' : 'border-slate-200 bg-white hover:shadow-md'}`}
                data-table={tableNo}
              >
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xl font-bold text-slate-700">{tableNo}号台</span>
                  {current ? (
                    <span class="px-3 py-1 text-xs bg-red-500 text-white rounded-full font-medium flex items-center gap-1">
                      <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      比赛中
                    </span>
                  ) : (
                    <span class="px-3 py-1 text-xs bg-slate-200 text-slate-600 rounded-full">空闲</span>
                  )}
                </div>

                {current ? (
                  <div class="space-y-3">
                    <div class="text-xs text-slate-500">{current.event_title}</div>
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-slate-800 truncate flex-1">{current.p1}</span>
                      <span class="text-2xl font-bold text-red-600 ml-2">{current.score1}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-slate-800 truncate flex-1">{current.p2}</span>
                      <span class="text-2xl font-bold text-red-600 ml-2">{current.score2}</span>
                    </div>
                    <div class="pt-2 flex gap-2">
                      <a
                        href={`/score/${current.id}`}
                        class="flex-1 text-center py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400"
                      >
                        录入
                      </a>
                      <button
                        onclick={`reassign(${current.id})`}
                        class="flex-1 py-2 text-sm border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50"
                      >
                        换台
                      </button>
                    </div>
                  </div>
                ) : next ? (
                  <div class="space-y-3">
                    <div class="text-xs text-slate-500">下一场 {next.time}</div>
                    <div class="text-sm text-slate-700 truncate font-medium">{next.p1}</div>
                    <div class="text-sm text-slate-700 truncate">vs {next.p2}</div>
                    <button
                      onclick={`startMatch(${next.id})`}
                      class="w-full mt-2 py-2 text-sm bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
                    >
                      开始比赛
                    </button>
                  </div>
                ) : (
                  <div class="text-center py-6 text-slate-400">
                    <div class="text-2xl mb-2 opacity-50">🏓</div>
                    <div class="text-sm">暂无比赛</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Queue */}
        <div class="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-800 mb-4">📋 待比赛队列</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto" id="queue">
            {matches
              .filter((m) => m.status === 'scheduled')
              .slice(0, 10)
              .map((m) => (
                <div class="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl text-sm">
                  <span class="text-slate-500 font-medium">{m.time}</span>
                  <span class="text-slate-700 font-medium">
                    {m.p1} <span class="text-slate-400">vs</span> {m.p2}
                  </span>
                  <span class="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs">{m.table_no}号台</span>
                </div>
              ))}
            {matches.filter((m) => m.status === 'scheduled').length === 0 && (
              <div class="text-center py-8 text-slate-400">暂无待比赛</div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      <script
        dangerouslySetInnerHTML={{
          __html: `
function refresh() { location.reload(); }
function startMatch(matchId) {
  fetch('/api/control/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: matchId }) })
    .then(r => r.json()).then(res => { if (res.success) location.reload(); else alert('错误: ' + res.error); });
}
function reassign(matchId) {
  var newTable = prompt('输入新球台号:');
  if (!newTable) return;
  fetch('/api/control/reassign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: matchId, tableNo: parseInt(newTable) }) })
    .then(r => r.json()).then(res => { if (res.success) location.reload(); else alert('错误: ' + res.error); });
}
document.getElementById('lastUpdate').textContent = '更新: ' + new Date().toLocaleTimeString();
setInterval(refresh, 30000);
`,
        }}
      />
    </Layout>
  );
};
