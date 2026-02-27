import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Group = { id: number; name: string; players: { id: number; position: number; name: string }[] };
type Player = { id: number; name: string; team: string };
type Ev = { id: number; title: string; stage: string };

export const DrawPage: FC<{ event: Ev; groups: Group[]; unassigned: Player[] }> = ({ event, groups, unassigned }) => (
  <Layout title={`抽签 - ${event.title}`}>
    <Nav current="/admin" title={`抽签 · ${event.title}`} />
    <PageWrapper>
      <div class="flex items-center justify-between mb-6">
        <a href="/admin/events" class="text-slate-400 hover:text-slate-600 text-sm">← 返回项目列表</a>
        <div class="flex gap-2">
          <button onclick="autoDraw()" class="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">🎲 随机抽签</button>
          <button onclick="clearDraw()" class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">清空</button>
          <button onclick="genMatches()" class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-lg shadow-emerald-500/25">生成对阵</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {groups.map((g, gi) => (
          <Card title={`${g.name} (${g.players.length}人)`}>
            <div class="space-y-2 min-h-[80px]" id={`group-${gi}`}>
              {g.players.map(p => (
                <div class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
                  <span><span class="text-slate-400 mr-2 font-mono">{p.position}.</span><span class="font-medium text-slate-700">{p.name}</span></span>
                  <button onclick={`remove(${g.id},${p.id})`} class="text-red-400 hover:text-red-600 text-sm transition-colors">✕</button>
                </div>
              ))}
              {g.players.length === 0 && <div class="text-slate-300 text-sm text-center py-4">暂无选手</div>}
            </div>
          </Card>
        ))}
      </div>

      <Card title={`待分配选手 (${unassigned.length})`}>
        <div class="flex flex-wrap gap-2">
          {unassigned.map(p => (
            <div class="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm hover:border-emerald-300 transition-colors">
              <span class="font-medium text-slate-700">{p.name}</span>
              <span class="text-slate-400 text-xs">{p.team}</span>
              <select onchange={`assign(${p.id},this.value);this.value=''`} class="ml-1 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500">
                <option value="">→组</option>
                {groups.map((g, i) => <option value={String(i + 1)}>{g.name}</option>)}
              </select>
            </div>
          ))}
          {unassigned.length === 0 && <span class="text-slate-400 text-sm">✓ 全部已分配</span>}
        </div>
      </Card>
    </PageWrapper>
    <Footer />

    <script dangerouslySetInnerHTML={{ __html: `
var eid=${event.id};
function api(url,body){return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());}
function assign(pid,gi){if(!gi)return;api('/api/admin/draw/assign',{event_id:eid,player_id:pid,group_index:parseInt(gi)}).then(function(){location.reload();});}
function remove(gid,pid){api('/api/admin/draw/remove',{group_id:gid,player_id:pid}).then(function(){location.reload();});}
function autoDraw(){if(!confirm('随机分配所有选手？'))return;api('/api/admin/draw/auto',{event_id:eid}).then(function(){location.reload();});}
function clearDraw(){if(!confirm('清空所有分组？'))return;api('/api/admin/draw/clear',{event_id:eid}).then(function(){location.reload();});}
function genMatches(){if(!confirm('根据当前分组生成对阵？'))return;api('/api/admin/draw/matches',{event_id:eid}).then(function(r){if(r.success){alert('已生成 '+r.count+' 场比赛');location.href='/schedule';}});}
`}} />
  </Layout>
);
