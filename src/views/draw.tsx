import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Group = { id: number; name: string; players: { id: number; position: number; name: string }[] };
type Player = { id: number; name: string; team: string };
type Ev = { id: number; title: string; stage: string };

export const DrawPage: FC<{ event: Ev; groups: Group[]; unassigned: Player[] }> = ({ event, groups, unassigned }) => (
  <Layout title={`抽签 - ${event.title}`}>
    <Nav current="/admin" />
    <div class="max-w-5xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <a href="/admin/events" class="text-gray-400 hover:text-gray-600">← 返回</a>
          <h2 class="text-lg font-bold text-gray-800">🎲 抽签 · {event.title}</h2>
        </div>
        <div class="flex gap-2">
          <button onclick="autoDraw()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">随机抽签</button>
          <button onclick="clearDraw()" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">清空</button>
          <button onclick="genMatches()" class="px-4 py-2 bg-pp-600 text-white rounded-lg text-sm hover:bg-pp-700">生成对阵</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {groups.map((g, gi) => (
          <Card title={`${g.name} (${g.players.length}人)`}>
            <div class="space-y-1 min-h-[60px]" id={`group-${gi}`}>
              {g.players.map(p => (
                <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-sm">
                  <span><span class="text-gray-400 mr-2">{p.position}.</span><span class="font-medium">{p.name}</span></span>
                  <button onclick={`remove(${g.id},${p.id})`} class="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Unassigned players */}
      <Card title={`待分配选手 (${unassigned.length})`}>
        <div class="flex flex-wrap gap-2">
          {unassigned.map(p => (
            <div class="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <span class="font-medium">{p.name}</span>
              <span class="text-gray-400 text-xs">{p.team}</span>
              <select onchange={`assign(${p.id},this.value);this.value=''`} class="ml-1 text-xs border border-gray-200 rounded px-1 py-0.5">
                <option value="">→组</option>
                {groups.map((g, i) => <option value={String(i + 1)}>{g.name}</option>)}
              </select>
            </div>
          ))}
          {unassigned.length === 0 && <span class="text-gray-400 text-sm">全部已分配</span>}
        </div>
      </Card>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
var eid=${event.id};
function api(url,body){return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());}
function assign(pid,gi){if(!gi)return;api('/api/admin/draw/assign',{event_id:eid,player_id:pid,group_index:parseInt(gi)}).then(function(){location.reload();});}
function remove(gid,pid){api('/api/admin/draw/remove',{group_id:gid,player_id:pid}).then(function(){location.reload();});}
function autoDraw(){if(!confirm('随机分配所有选手？'))return;api('/api/admin/draw/auto',{event_id:eid}).then(function(){location.reload();});}
function clearDraw(){if(!confirm('清空所有分组？'))return;api('/api/admin/draw/clear',{event_id:eid}).then(function(){location.reload();});}
function genMatches(){if(!confirm('根据当前分组生成对阵？'))return;api('/api/admin/draw/matches',{event_id:eid}).then(function(r){if(r.success){alert('已生成 '+r.count+' 场比赛');location.href='/schedule';}});}
` }} />
  </Layout>
);
