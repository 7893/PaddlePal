import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge, PageWrapper, Footer } from '../components/layout';

type Team = { id: number; name: string; short_name: string; count: number };
type Player = { id: number; name: string; gender: string; team: string; team_id: number };
type Event = { id: number; title: string; type: string; stage: string; groups: number; best_of: number };
type Match = { pid: number; time: string; status: string; result: string; player1: string; player2: string; event: string; table: number };

export const AdminPage: FC<{
  info: string; venue: string; teams: Team[]; players: Player[];
  events: Event[]; matches: Match[];
}> = ({ info: _info, venue: _venue, teams, players, events, matches }) => (
  <Layout title="管理后台">
    <Nav current="/admin" title="管理后台" />
    <PageWrapper>
      {/* Stats cards */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div class="text-4xl font-bold">{players.length}</div>
          <div class="text-emerald-100 mt-1">参赛选手</div>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25">
          <div class="text-4xl font-bold">{teams.length}</div>
          <div class="text-blue-100 mt-1">参赛队伍</div>
        </div>
        <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/25">
          <div class="text-4xl font-bold">{events.length}</div>
          <div class="text-amber-100 mt-1">比赛项目</div>
        </div>
        <div class="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/25">
          <div class="text-4xl font-bold">{matches.length}</div>
          <div class="text-rose-100 mt-1">比赛场次</div>
        </div>
      </div>

      {/* Quick actions */}
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">快捷操作</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { href: '/admin/draw', icon: '🎲', label: '抽签管理', color: 'emerald' },
            { href: '/admin/control', icon: '🎮', label: '控场面板', color: 'red' },
            { href: '/admin/confirm', icon: '✅', label: '成绩确认', color: 'green' },
            { href: '/admin/checkin', icon: '📋', label: '选手检录', color: 'orange' },
            { href: '/score', icon: '📝', label: '比分录入', color: 'blue' },
            { href: '/bigscreen', icon: '📺', label: '大屏展示', color: 'purple' },
            { href: '/admin/users', icon: '👥', label: '用户管理', color: 'indigo' },
            { href: '/admin/appeals', icon: '📨', label: '申诉管理', color: 'yellow' },
            { href: '/admin/logs', icon: '📜', label: '操作日志', color: 'slate' },
            { href: '/admin/settings', icon: '⚙️', label: '系统设置', color: 'gray' },
            { href: '/api/backup', icon: '💾', label: '数据备份', color: 'cyan' },
            { href: '/batch-score', icon: '⚡', label: '批量录入', color: 'teal' },
          ].map(item => (
            <a href={item.href} class="flex flex-col items-center gap-2 p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-slate-300 transition-all group">
              <span class="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span class="text-sm font-medium text-slate-700">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">导出文档</h2>
        <div class="flex flex-wrap gap-3">
          <a href="/api/export/program" target="_blank" class="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">📕 秩序册</a>
          <a href="/api/export/results-book" target="_blank" class="px-5 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">📗 成绩册</a>
          <a href="/api/export/scoresheets" target="_blank" class="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">📝 记录表</a>
          <a href="/api/export/csv/players" class="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">📥 选手CSV</a>
          <a href="/api/export/csv/results" class="px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">📥 成绩CSV</a>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events */}
        <Card title="📋 赛事项目">
          <div class="space-y-3">
            {events.map(e => (
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div class="font-semibold text-slate-800">{e.title}</div>
                  <div class="text-sm text-slate-500">{e.type} · {e.best_of}局{Math.ceil(e.best_of / 2)}胜</div>
                </div>
                <Badge color={e.stage === 'loop' ? 'blue' : 'yellow'}>{e.stage === 'loop' ? '循环赛' : '淘汰赛'}</Badge>
              </div>
            ))}
            {events.length === 0 && <div class="text-center py-8 text-slate-400">暂无项目</div>}
          </div>
        </Card>

        {/* Teams */}
        <Card title="👥 参赛队伍">
          <div class="grid grid-cols-2 gap-3">
            {teams.map(t => (
              <div class="p-4 bg-slate-50 rounded-xl">
                <div class="font-semibold text-slate-800">{t.name}</div>
                <div class="text-sm text-slate-500">{t.count} 名选手</div>
              </div>
            ))}
            {teams.length === 0 && <div class="col-span-2 text-center py-8 text-slate-400">暂无队伍</div>}
          </div>
        </Card>
      </div>

      {/* Recent matches */}
      <Card title="🎯 最近比赛" class="mt-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 border-b border-slate-100">
                <th class="pb-3 font-semibold">场次</th>
                <th class="pb-3 font-semibold">对阵</th>
                <th class="pb-3 font-semibold">比分</th>
                <th class="pb-3 font-semibold">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {matches.slice(0, 15).map(m => (
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 text-slate-400 font-mono">{m.pid}</td>
                  <td class="py-3">
                    <span class="font-semibold text-slate-800">{m.player1}</span>
                    <span class="text-slate-400 mx-2">vs</span>
                    <span class="font-semibold text-slate-800">{m.player2}</span>
                  </td>
                  <td class="py-3 font-mono text-slate-700">{m.result || '-'}</td>
                  <td class="py-3">
                    <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                      {m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行中' : '待赛'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && <div class="text-center py-8 text-slate-400">暂无比赛记录</div>}
        </div>
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);
