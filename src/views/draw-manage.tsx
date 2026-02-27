import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Group = {
  id: number; name: string;
  players: { player_id: number; position: number; seed: number; name: string; team: string }[];
};
type Player = { id: number; name: string; team: string; rating: number };

export const DrawManagePage: FC<{ eventKey: string; eventTitle: string; groups: Group[]; unassigned: Player[] }> = ({ eventKey, eventTitle, groups, unassigned }) => {
  const assigned = groups.reduce((sum, g) => sum + g.players.length, 0);
  const total = assigned + unassigned.length;

  return (
    <Layout title={`抽签管理 - ${eventTitle}`}>
      <Nav current="/admin/draw" title={`抽签管理 · ${eventTitle}`} />
      <PageWrapper>
        {/* Stats */}
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{total}</div>
            <div class="text-sm text-slate-500 mt-1">总人数</div>
          </div>
          <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-emerald-500/25">
            <div class="text-3xl font-bold">{assigned}</div>
            <div class="text-sm text-emerald-100 mt-1">已分配</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-amber-500">{unassigned.length}</div>
            <div class="text-sm text-slate-500 mt-1">待分配</div>
          </div>
        </div>

        {/* Draw settings */}
        <Card title="抽签设置" class="mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">小组数</label>
              <select id="groupCount" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="2">2组</option>
                <option value="3">3组</option>
                <option value="4" selected>4组</option>
                <option value="5">5组</option>
                <option value="6">6组</option>
                <option value="8">8组</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">种子数</label>
              <select id="seedCount" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="0">无种子</option>
                <option value="2">2个种子</option>
                <option value="4" selected>4个种子</option>
                <option value="8">8个种子</option>
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="separateTeams" checked class="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                <span class="text-sm text-slate-600">同队分开</span>
              </label>
            </div>
            <div class="flex items-end gap-3">
              <button onclick="executeDraw()" class="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25">执行抽签</button>
              <button onclick="resetDraw()" class="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">重置</button>
            </div>
          </div>
        </Card>

        {/* Groups */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          {groups.map(g => (
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-5 py-3 bg-slate-50 font-semibold text-slate-700 border-b border-slate-100">{g.name}组</div>
              <div class="p-4 min-h-[180px]">
                {g.players.length > 0 ? (
                  <div class="space-y-2">
                    {g.players.map((p, i) => (
                      <div class={`flex items-center justify-between px-3 py-2 rounded-xl ${p.seed ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                        <span class="text-sm">
                          <span class="text-slate-400 mr-2">{i + 1}.</span>
                          <span class="font-medium text-slate-800">{p.name}</span>
                          {p.seed > 0 && <span class="text-amber-500 ml-1">★</span>}
                        </span>
                        <span class="text-xs text-slate-400">{p.team}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div class="text-slate-400 text-sm text-center py-8">空</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned */}
        {unassigned.length > 0 && (
          <Card title={`待分配选手 (${unassigned.length}人)`}>
            <div class="flex flex-wrap gap-2">
              {unassigned.map(p => (
                <span class="px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
                  <span class="font-medium text-slate-700">{p.name}</span>
                  <span class="text-slate-400 ml-1">{p.team}</span>
                </span>
              ))}
            </div>
          </Card>
        )}
      </PageWrapper>
      <Footer />

      <script dangerouslySetInnerHTML={{ __html: `
var eventKey = '${eventKey}';
function api(url, body) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
}
function executeDraw() {
  var groupCount = parseInt(document.getElementById('groupCount').value);
  var seedCount = parseInt(document.getElementById('seedCount').value);
  var separateTeams = document.getElementById('separateTeams').checked;
  if (!confirm('确定执行抽签？现有分组将被清除。')) return;
  api('/api/draw/roundrobin/' + eventKey + '/execute', { groupCount, seedCount, separateTeams }).then(function(res) {
    if (res.success) { alert('抽签完成！共 ' + res.totalPlayers + ' 人分入 ' + res.groupCount + ' 组'); location.reload(); }
    else alert('错误: ' + res.error);
  });
}
function resetDraw() {
  if (!confirm('确定重置？所有分组将被清除。')) return;
  api('/api/draw/roundrobin/' + eventKey + '/reset', {}).then(function(res) { if (res.success) location.reload(); });
}
`}} />
    </Layout>
  );
};
