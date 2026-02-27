import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';
import { StatCard, StatBox } from '../components/match';

type Group = {
  id: number;
  name: string;
  players: { player_id: number; position: number; seed: number; name: string; team: string }[];
};
type Player = { id: number; name: string; team: string; rating: number };

export const DrawManagePage: FC<{ eventKey: string; eventTitle: string; groups: Group[]; unassigned: Player[] }> = ({
  eventKey,
  eventTitle,
  groups,
  unassigned,
}) => {
  const assigned = groups.reduce((sum, g) => sum + g.players.length, 0);

  return (
    <Layout title={`抽签管理 - ${eventTitle}`}>
      <Nav current="/admin/draw" title={`抽签管理 · ${eventTitle}`} />
      <PageWrapper>
        <div class="grid grid-cols-3 gap-4 mb-8">
          <StatBox label="总人数" value={assigned + unassigned.length} color="slate" />
          <StatCard label="已分配" value={assigned} color="emerald" />
          <StatBox label="待分配" value={unassigned.length} color="slate" />
        </div>

        <Card title="抽签设置" class="mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">小组数</label>
              <select
                id="groupCount"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                {[2, 3, 4, 5, 6, 8].map((n) => (
                  <option value={n} selected={n === 4}>
                    {n}组
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">种子数</label>
              <select
                id="seedCount"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                {[0, 2, 4, 8].map((n) => (
                  <option value={n} selected={n === 4}>
                    {n === 0 ? '无种子' : `${n}个种子`}
                  </option>
                ))}
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="separateTeams"
                  checked
                  class="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span class="text-sm text-slate-600">同队分开</span>
              </label>
            </div>
            <div class="flex items-end gap-3">
              <button
                onclick="executeDraw()"
                class="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
              >
                执行抽签
              </button>
              <button
                onclick="resetDraw()"
                class="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
              >
                重置
              </button>
            </div>
          </div>
        </Card>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          {groups.map((g) => (
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-5 py-3 bg-slate-50 font-semibold text-slate-700 border-b border-slate-100">{g.name}组</div>
              <div class="p-4 min-h-[180px]">
                {g.players.length > 0 ? (
                  <div class="space-y-2">
                    {g.players.map((p, i) => (
                      <div
                        class={`flex items-center justify-between px-3 py-2 rounded-xl ${p.seed ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}
                      >
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

        {unassigned.length > 0 && (
          <Card title={`待分配选手 (${unassigned.length}人)`}>
            <div class="flex flex-wrap gap-2">
              {unassigned.map((p) => (
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
      <script
        dangerouslySetInnerHTML={{
          __html: `var eventKey='${eventKey}';function api(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json())}function executeDraw(){var g=parseInt(document.getElementById('groupCount').value),s=parseInt(document.getElementById('seedCount').value),t=document.getElementById('separateTeams').checked;if(!confirm('确定执行抽签？'))return;api('/api/draw/roundrobin/'+eventKey+'/execute',{groupCount:g,seedCount:s,separateTeams:t}).then(r=>{if(r.success){alert('抽签完成！');location.reload()}else alert('错误: '+r.error)})}function resetDraw(){if(!confirm('确定重置？'))return;api('/api/draw/roundrobin/'+eventKey+'/reset',{}).then(r=>{if(r.success)location.reload()})}`,
        }}
      />
    </Layout>
  );
};
