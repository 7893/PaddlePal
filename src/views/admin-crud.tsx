import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';
import { AdminNav } from './admin-edit';

// Teams management
type Team = { id: number; name: string; short_name: string; count: number };
export const TeamsEditPage: FC<{ teams: Team[] }> = ({ teams }) => (
  <Layout title="队伍管理">
    <Nav current="/admin" />
    <div class="max-w-3xl mx-auto px-4 py-6 fade-in">
      <AdminNav current="/admin/teams" />
      <Card title="👥 队伍列表">
        <table class="w-full text-sm mb-4">
          <thead><tr class="text-left text-gray-500"><th class="pb-2">队名</th><th class="pb-2">简称</th><th class="pb-2">人数</th><th class="pb-2"></th></tr></thead>
          <tbody class="divide-y divide-gray-100">
            {teams.map(t => (
              <tr class="hover:bg-gray-50">
                <td class="py-2 font-medium">{t.name}</td>
                <td class="py-2 text-gray-600">{t.short_name}</td>
                <td class="py-2 text-gray-600">{t.count}</td>
                <td class="py-2"><button onclick={`del(${t.id})`} class="text-red-500 text-xs hover:underline">删除</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="➕ 新增队伍" class="mt-4">
        <form id="f" class="flex gap-3">
          <input name="name" placeholder="队伍全称" class="flex-1 border border-gray-300 rounded-lg px-3 py-2" required />
          <input name="short_name" placeholder="简称" class="w-28 border border-gray-300 rounded-lg px-3 py-2" required />
          <button type="submit" class="px-6 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">添加</button>
        </form>
      </Card>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/teams?id='+id,{method:'DELETE'}).then(r=>r.json()).then(function(){location.reload()});}
document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach(function(v,k){d[k]=v});fetch('/api/admin/teams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(function(r){if(r.success)location.reload();});};
` }} />
  </Layout>
);

// Players management
type Player = { id: number; name: string; gender: string; team: string; rating: number };
export const PlayersEditPage: FC<{ players: Player[]; teams: { id: number; name: string }[] }> = ({ players, teams }) => (
  <Layout title="选手管理">
    <Nav current="/admin" />
    <div class="max-w-3xl mx-auto px-4 py-6 fade-in">
      <AdminNav current="/admin/players" />
      <Card title={`🏓 选手列表 (${players.length})`}>
        <table class="w-full text-sm mb-4">
          <thead><tr class="text-left text-gray-500"><th class="pb-2">姓名</th><th class="pb-2">性别</th><th class="pb-2">队伍</th><th class="pb-2">积分</th><th class="pb-2"></th></tr></thead>
          <tbody class="divide-y divide-gray-100">
            {players.map(p => (
              <tr class="hover:bg-gray-50">
                <td class="py-2 font-medium">{p.name}</td>
                <td class="py-2 text-gray-600">{p.gender === 'M' ? '男' : p.gender === 'W' ? '女' : '混'}</td>
                <td class="py-2 text-gray-500">{p.team}</td>
                <td class="py-2 text-gray-600">{p.rating || '-'}</td>
                <td class="py-2"><button onclick={`del(${p.id})`} class="text-red-500 text-xs hover:underline">删除</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="➕ 新增选手" class="mt-4">
        <form id="f" class="flex gap-3 flex-wrap">
          <input name="name" placeholder="姓名" class="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2" required />
          <select name="gender" class="w-20 border border-gray-300 rounded-lg px-3 py-2">
            <option value="M">男</option><option value="W">女</option><option value="X">混</option>
          </select>
          <select name="team_id" class="w-36 border border-gray-300 rounded-lg px-3 py-2">
            <option value="0">无队伍</option>
            {teams.map(t => <option value={String(t.id)}>{t.name}</option>)}
          </select>
          <button type="submit" class="px-6 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">添加</button>
        </form>
      </Card>
      <Card title="📋 批量导入" class="mt-4">
        <textarea id="bulk" rows={4} placeholder="每行一个：姓名,性别(M/W),队伍名" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"></textarea>
        <button onclick="bulkImport()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">批量导入</button>
      </Card>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/players?id='+id,{method:'DELETE'}).then(r=>r.json()).then(function(){location.reload()});}
document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach(function(v,k){d[k]=k==='team_id'?parseInt(v):v});fetch('/api/admin/players',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(function(r){if(r.success)location.reload();});};
function bulkImport(){var data=document.getElementById('bulk').value;if(!data.trim())return;fetch('/api/admin/players/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:data})}).then(r=>r.json()).then(function(r){if(r.success){alert('导入 '+r.count+' 人');location.reload();}});}
` }} />
  </Layout>
);

// Notices management
type Notice = { id: number; title: string; content: string; created_at: string };
export const NoticesEditPage: FC<{ notices: Notice[] }> = ({ notices }) => (
  <Layout title="公告管理">
    <Nav current="/admin" />
    <div class="max-w-3xl mx-auto px-4 py-6 fade-in">
      <AdminNav current="/admin/notices" />
      <Card title="📢 公告列表">
        {notices.length === 0 ? <div class="text-gray-400 text-center py-4">暂无公告</div> : (
          <div class="space-y-3">
            {notices.map(n => (
              <div class="border border-gray-200 rounded-lg p-3 flex justify-between items-start">
                <div><div class="font-medium text-gray-800">{n.title || '(无标题)'}</div><div class="text-sm text-gray-500 mt-1">{n.content}</div><div class="text-xs text-gray-400 mt-1">{n.created_at}</div></div>
                <button onclick={`del(${n.id})`} class="text-red-500 text-xs hover:underline ml-4">删除</button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="➕ 发布公告" class="mt-4">
        <form id="f" class="space-y-3">
          <input name="title" placeholder="标题" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          <textarea name="content" placeholder="内容" rows={3} class="w-full border border-gray-300 rounded-lg px-3 py-2" required></textarea>
          <button type="submit" class="px-6 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">发布</button>
        </form>
      </Card>
    </div>
    <script dangerouslySetInnerHTML={{ __html: `
function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/notice',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id})}).then(r=>r.json()).then(function(){location.reload()});}
document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach(function(v,k){d[k]=v});fetch('/api/admin/notice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(function(r){if(r.success)location.reload();});};
` }} />
  </Layout>
);
