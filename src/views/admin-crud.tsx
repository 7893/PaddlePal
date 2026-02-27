import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Input, Select, Textarea, Button } from '../components/layout';
import { AdminNav } from './admin-edit';

type Team = { id: number; name: string; short_name: string; count: number };
export const TeamsEditPage: FC<{ teams: Team[] }> = ({ teams }) => (
  <Layout title="队伍管理">
    <Nav current="/admin" title="队伍管理" />
    <PageWrapper>
      <AdminNav current="/admin/teams" />
      <Card title={`👥 队伍列表 (${teams.length})`}>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200">
              <th class="pb-3">队名</th>
              <th class="pb-3">简称</th>
              <th class="pb-3">人数</th>
              <th class="pb-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {teams.map((t) => (
              <tr class="hover:bg-slate-50">
                <td class="py-3 font-medium text-slate-800">{t.name}</td>
                <td class="py-3 text-slate-600">{t.short_name}</td>
                <td class="py-3 text-slate-600">{t.count}</td>
                <td class="py-3">
                  <button onclick={`del(${t.id})`} class="text-red-500 text-xs hover:underline">
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="➕ 新增队伍" class="mt-4">
        <form id="f" class="flex gap-3">
          <Input name="name" placeholder="队伍全称" class="flex-1" required />
          <Input name="short_name" placeholder="简称" class="w-28" required />
          <Button type="submit">添加</Button>
        </form>
      </Card>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/teams?id='+id,{method:'DELETE'}).then(r=>r.json()).then(()=>location.reload())}document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach((v,k)=>d[k]=v);fetch('/api/admin/teams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(r=>{if(r.success)location.reload()})}`,
      }}
    />
  </Layout>
);

type Player = { id: number; name: string; gender: string; team: string; rating: number };
export const PlayersEditPage: FC<{ players: Player[]; teams: { id: number; name: string }[] }> = ({
  players,
  teams,
}) => (
  <Layout title="选手管理">
    <Nav current="/admin" title="选手管理" />
    <PageWrapper>
      <AdminNav current="/admin/players" />
      <Card title={`🏓 选手列表 (${players.length})`}>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200">
              <th class="pb-3">姓名</th>
              <th class="pb-3">性别</th>
              <th class="pb-3">队伍</th>
              <th class="pb-3">积分</th>
              <th class="pb-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {players.map((p) => (
              <tr class="hover:bg-slate-50">
                <td class="py-3 font-medium text-slate-800">{p.name}</td>
                <td class="py-3 text-slate-600">{p.gender === 'M' ? '男' : p.gender === 'W' ? '女' : '混'}</td>
                <td class="py-3 text-slate-500">{p.team}</td>
                <td class="py-3 text-slate-600">{p.rating || '-'}</td>
                <td class="py-3">
                  <button onclick={`del(${p.id})`} class="text-red-500 text-xs hover:underline">
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="➕ 新增选手" class="mt-4">
        <form id="f" class="flex gap-3 flex-wrap">
          <Input name="name" placeholder="姓名" class="flex-1 min-w-[120px]" required />
          <Select name="gender" class="w-20">
            <option value="M">男</option>
            <option value="W">女</option>
            <option value="X">混</option>
          </Select>
          <Select name="team_id" class="w-36">
            <option value="0">无队伍</option>
            {teams.map((t) => (
              <option value={String(t.id)}>{t.name}</option>
            ))}
          </Select>
          <Button type="submit">添加</Button>
        </form>
      </Card>
      <Card title="📋 批量导入" class="mt-4">
        <Textarea id="bulk" rows={4} placeholder="每行一个：姓名,性别(M/W),队伍名" class="w-full mb-3" />
        <button
          onclick="bulkImport()"
          class="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 text-sm"
        >
          文本导入
        </button>
        <div class="mt-4 pt-4 border-t border-slate-100">
          <label class="text-sm text-slate-600 block mb-2">Excel 导入（.xlsx/.xls，列：姓名、性别、队伍）</label>
          <input type="file" id="xlfile" accept=".xlsx,.xls,.csv" class="text-sm" />
          <button
            onclick="xlImport()"
            class="ml-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-sm"
          >
            导入
          </button>
        </div>
      </Card>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/players?id='+id,{method:'DELETE'}).then(r=>r.json()).then(()=>location.reload())}document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach((v,k)=>d[k]=k==='team_id'?+v:v);fetch('/api/admin/players',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(r=>{if(r.success)location.reload()})}function bulkImport(){var d=document.getElementById('bulk').value;if(!d.trim())return;fetch('/api/admin/players/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:d})}).then(r=>r.json()).then(r=>{if(r.success){alert('导入 '+r.count+' 人');location.reload()}})}function xlImport(){var f=document.getElementById('xlfile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var wb=XLSX.read(e.target.result,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{header:1}),lines=[];for(var i=0;i<rows.length;i++){var x=rows[i];if(x[0]&&String(x[0]).trim())lines.push(x.join(','))}fetch('/api/admin/players/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:lines.join('\\n')})}).then(r=>r.json()).then(r=>{if(r.success){alert('导入 '+r.count+' 人');location.reload()}})};r.readAsArrayBuffer(f)}`,
      }}
    />
  </Layout>
);

type Notice = { id: number; title: string; content: string; created_at: string };
export const NoticesEditPage: FC<{ notices: Notice[] }> = ({ notices }) => (
  <Layout title="公告管理">
    <Nav current="/admin" title="公告管理" />
    <PageWrapper>
      <AdminNav current="/admin/notices" />
      <Card title="📢 公告列表">
        {notices.length === 0 ? (
          <div class="text-slate-400 text-center py-8">暂无公告</div>
        ) : (
          <div class="space-y-3">
            {notices.map((n) => (
              <div class="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:bg-slate-50">
                <div>
                  <div class="font-medium text-slate-800">{n.title || '(无标题)'}</div>
                  <div class="text-sm text-slate-500 mt-1">{n.content}</div>
                  <div class="text-xs text-slate-400 mt-2">{n.created_at}</div>
                </div>
                <button onclick={`del(${n.id})`} class="text-red-500 text-xs hover:underline ml-4">
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="➕ 发布公告" class="mt-4">
        <form id="f" class="space-y-3">
          <Input name="title" placeholder="标题" class="w-full" />
          <Textarea name="content" placeholder="内容" rows={3} class="w-full" />
          <Button type="submit">发布</Button>
        </form>
      </Card>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/notice',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}).then(r=>r.json()).then(()=>location.reload())}document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach((v,k)=>d[k]=v);fetch('/api/admin/notice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(r=>{if(r.success)location.reload()})}`,
      }}
    />
  </Layout>
);
