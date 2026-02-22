import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge } from '../components/layout';

type Team = { id: number; name: string; short_name: string; count: number };
type Player = { id: number; name: string; gender: string; team: string; team_id: number };
type Event = { id: number; title: string; type: string; stage: string; groups: number; best_of: number };
type Match = { pid: number; time: string; status: string; result: string; player1: string; player2: string; event: string; table: number };

export const AdminPage: FC<{
  info: string; venue: string; teams: Team[]; players: Player[];
  events: Event[]; matches: Match[];
}> = ({ info, venue, teams, players, events, matches }) => (
  <Layout title="管理后台">
    <Nav current="/admin" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">⚙️ 管理后台</h2>
        <a href="/logout" class="text-sm text-gray-500 hover:text-red-600">退出登录 →</a>
      </div>

      {/* Tournament info */}
      <Card title="🏆 赛事信息" class="mb-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">赛事名称：</span><span class="font-medium">{info}</span></div>
          <div><span class="text-gray-500">比赛场馆：</span><span class="font-medium">{venue}</span></div>
        </div>
      </Card>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Stats */}
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{players.length}</div>
          <div class="text-blue-100 text-sm">参赛选手</div>
        </div>
        <div class="bg-gradient-to-br from-pp-500 to-pp-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{teams.length}</div>
          <div class="text-green-100 text-sm">参赛队伍</div>
        </div>
        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{matches.length}</div>
          <div class="text-amber-100 text-sm">比赛场次</div>
        </div>
      </div>

      {/* Events */}
      <Card title="📋 赛事项目" class="mb-4">
        <table class="w-full text-sm">
          <thead><tr class="text-left text-gray-500"><th class="pb-2">项目</th><th class="pb-2">类型</th><th class="pb-2">阶段</th><th class="pb-2">小组</th><th class="pb-2">局制</th></tr></thead>
          <tbody class="divide-y divide-gray-100">
            {events.map(e => (
              <tr class="hover:bg-gray-50">
                <td class="py-2 font-medium text-gray-800">{e.title}</td>
                <td class="py-2 text-gray-600">{e.type}</td>
                <td class="py-2"><Badge color={e.stage === 'loop' ? 'blue' : 'yellow'}>{e.stage === 'loop' ? '循环' : '淘汰'}</Badge></td>
                <td class="py-2 text-gray-600">{e.groups || '-'}</td>
                <td class="py-2 text-gray-600">{e.best_of}局{Math.ceil(e.best_of / 2)}胜</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Teams */}
      <Card title="👥 队伍列表" class="mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          {teams.map(t => (
            <div class="border border-gray-200 rounded-lg px-3 py-2">
              <div class="font-medium text-gray-800 text-sm">{t.name}</div>
              <div class="text-xs text-gray-400">{t.count} 人</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Players */}
      <Card title="🏓 选手列表" class="mb-4">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-gray-500"><th class="pb-2">姓名</th><th class="pb-2">队伍</th><th class="pb-2">积分</th></tr></thead>
            <tbody class="divide-y divide-gray-100">
              {players.map(p => (
                <tr class="hover:bg-gray-50">
                  <td class="py-1.5 font-medium text-gray-800">{p.name}</td>
                  <td class="py-1.5 text-gray-500">{p.team}</td>
                  <td class="py-1.5 text-gray-600">{(p as any).rating || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent matches */}
      <Card title="🎯 比赛记录（最近20场）">
        <div class="flex gap-2 mb-3">
          <a href="/api/admin/export/schedule" class="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100">📥 导出赛程</a>
          <a href="/api/admin/export/results" class="px-3 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100">📥 导出成绩</a>
          <a href="/api/admin/export/players" class="px-3 py-1 bg-amber-50 text-amber-600 rounded text-xs hover:bg-amber-100">📥 导出选手</a>
          <a href="/api/admin/backup" class="px-3 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100">💾 完整备份</a>
        </div>
        <table class="w-full text-sm">
          <thead><tr class="text-left text-gray-500"><th class="pb-2">场次</th><th class="pb-2">对阵</th><th class="pb-2">比分</th><th class="pb-2">状态</th></tr></thead>
          <tbody class="divide-y divide-gray-100">
            {matches.slice(0, 20).map(m => (
              <tr class="hover:bg-gray-50">
                <td class="py-1.5 text-gray-400 font-mono text-xs">{m.pid}</td>
                <td class="py-1.5"><span class="font-medium text-gray-800">{m.player1}</span> <span class="text-gray-300">vs</span> <span class="font-medium text-gray-800">{m.player2}</span></td>
                <td class="py-1.5 font-mono text-gray-700">{m.result || '-'}</td>
                <td class="py-1.5"><Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>{m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行' : '待赛'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  </Layout>
);
