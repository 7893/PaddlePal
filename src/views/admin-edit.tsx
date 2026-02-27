import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Input, Select, Button, FormGroup } from '../components/layout';

const AdminNav: FC<{ current: string }> = ({ current }) => {
  const tabs = [
    { href: '/admin', label: '总览' },
    { href: '/admin/tournament', label: '赛事信息' },
    { href: '/admin/events', label: '项目管理' },
    { href: '/admin/teams', label: '队伍管理' },
    { href: '/admin/players', label: '选手管理' },
    { href: '/admin/notices', label: '公告管理' },
  ];
  return (
    <div class="flex gap-2 mb-6 flex-wrap">
      {tabs.map((t) => (
        <a
          href={t.href}
          class={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${current === t.href ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
};

export { AdminNav };

export const TournamentEditPage: FC<{ info: string; venue: string; start_date: string; tables: number }> = (p) => (
  <Layout title="赛事信息">
    <Nav current="/admin" title="赛事信息" />
    <PageWrapper>
      <AdminNav current="/admin/tournament" />
      <Card title="🏆 编辑赛事信息">
        <form id="f" class="space-y-4">
          <FormGroup label="赛事名称">
            <Input name="info" value={p.info} class="w-full" />
          </FormGroup>
          <FormGroup label="比赛场馆">
            <Input name="venue" value={p.venue} class="w-full" />
          </FormGroup>
          <div class="flex gap-4">
            <div class="flex-1">
              <FormGroup label="开始日期">
                <Input name="start_date" type="date" value={p.start_date} class="w-full" />
              </FormGroup>
            </div>
            <div class="w-32">
              <FormGroup label="球台数">
                <Input name="tables" type="number" value={String(p.tables)} class="w-full" />
              </FormGroup>
            </div>
          </div>
          <Button type="submit">保存</Button>
        </form>
      </Card>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach((v,k)=>d[k]=v);fetch('/api/admin/tournament',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(r=>{if(r.success)alert('已保存')})}`,
      }}
    />
  </Layout>
);

type Ev = { id: number; title: string; type: string; stage: string; groups: number; best_of: number };
export const EventsEditPage: FC<{ events: Ev[] }> = ({ events }) => (
  <Layout title="项目管理">
    <Nav current="/admin" title="项目管理" />
    <PageWrapper>
      <AdminNav current="/admin/events" />
      <Card title={`📋 项目列表 (${events.length})`}>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200">
              <th class="pb-3">项目</th>
              <th class="pb-3">类型</th>
              <th class="pb-3">阶段</th>
              <th class="pb-3">组数</th>
              <th class="pb-3">局制</th>
              <th class="pb-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {events.map((e) => (
              <tr class="hover:bg-slate-50">
                <td class="py-3 font-medium text-slate-800">{e.title}</td>
                <td class="py-3 text-slate-600">{e.type}</td>
                <td class="py-3 text-slate-600">{e.stage === 'loop' ? '循环' : '淘汰'}</td>
                <td class="py-3 text-slate-600">{e.groups || '-'}</td>
                <td class="py-3 text-slate-600">{e.best_of}</td>
                <td class="py-3 space-x-2">
                  <button onclick={`del(${e.id})`} class="text-red-500 text-xs hover:underline">
                    删除
                  </button>
                  <a href={`/admin/draw/${e.id}`} class="text-emerald-600 text-xs hover:underline">
                    抽签
                  </a>
                  {e.stage === 'knockout' && (
                    <a href={`/bracket/${e.id}`} class="text-blue-600 text-xs hover:underline">
                      对阵图
                    </a>
                  )}
                  {e.type === 'XT' && (
                    <a href={`/team/${e.id}`} class="text-blue-600 text-xs hover:underline">
                      团体
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="➕ 新增项目" class="mt-4">
        <form id="f" class="space-y-4">
          <div class="flex gap-3">
            <div class="flex-1">
              <Input name="title" placeholder="项目名称" class="w-full" required />
            </div>
            <div class="w-28">
              <Select name="type" class="w-full">
                <option value="XS">单打</option>
                <option value="XD">双打</option>
                <option value="XT">团体</option>
              </Select>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-32">
              <Select name="stage" class="w-full">
                <option value="loop">循环赛</option>
                <option value="knockout">淘汰赛</option>
              </Select>
            </div>
            <div class="w-24">
              <Input name="groups" type="number" value="4" placeholder="组数" class="w-full" />
            </div>
            <div class="w-24">
              <Input name="best_of" type="number" value="3" placeholder="局制" class="w-full" />
            </div>
          </div>
          <Button type="submit">添加</Button>
        </form>
      </Card>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function del(id){if(!confirm('确定删除？'))return;fetch('/api/admin/events?id='+id,{method:'DELETE'}).then(r=>r.json()).then(()=>location.reload())}document.getElementById('f').onsubmit=function(e){e.preventDefault();var d={};new FormData(this).forEach((v,k)=>d[k]=k==='groups'||k==='best_of'?+v:v);fetch('/api/admin/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(r=>{if(r.success)location.reload()})}`,
      }}
    />
  </Layout>
);
