import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

export const DashboardPage: FC<{
  stats: { players: number; teams: number; total_matches: number; finished: number; playing: number; scheduled: number };
  recentResults: { id: number; p1: string; p2: string; score1: number; score2: number }[];
}> = ({ stats, recentResults }) => (
  <Layout title="仪表盘">
    <Nav current="/" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-6">📊 赛事仪表盘</h2>

      {/* 统计卡片 */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{stats.players}</div>
          <div class="text-blue-100 text-sm">参赛选手</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{stats.teams}</div>
          <div class="text-green-100 text-sm">参赛队伍</div>
        </div>
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{stats.playing}</div>
          <div class="text-red-100 text-sm">进行中</div>
        </div>
        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div class="text-3xl font-bold">{stats.finished}/{stats.total_matches}</div>
          <div class="text-amber-100 text-sm">已完成</div>
        </div>
      </div>

      {/* 进度条 */}
      <Card title="比赛进度" class="mb-6">
        <div class="flex items-center gap-4">
          <div class="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full transition-all" style={`width:${stats.total_matches > 0 ? Math.round(stats.finished / stats.total_matches * 100) : 0}%`}></div>
          </div>
          <span class="text-sm font-medium text-gray-600">
            {stats.total_matches > 0 ? Math.round(stats.finished / stats.total_matches * 100) : 0}%
          </span>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-2">
          <span>已完成 {stats.finished}</span>
          <span>进行中 {stats.playing}</span>
          <span>待赛 {stats.scheduled}</span>
        </div>
      </Card>

      {/* 最新成绩 */}
      <Card title="最新成绩">
        <div class="space-y-2">
          {recentResults.map(r => (
            <a href={`/match/${r.id}`} class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg">
              <span class={r.score1 > r.score2 ? 'font-medium text-green-600' : ''}>{r.p1}</span>
              <span class="text-lg font-bold text-gray-700">{r.score1} : {r.score2}</span>
              <span class={r.score2 > r.score1 ? 'font-medium text-green-600' : ''}>{r.p2}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* 快捷入口 */}
      <div class="grid grid-cols-4 gap-3 mt-6">
        <a href="/live" class="text-center p-3 bg-white border border-gray-200 rounded-xl hover:border-pp-300">
          <div class="text-2xl">📺</div>
          <div class="text-xs text-gray-600 mt-1">实时比分</div>
        </a>
        <a href="/schedule" class="text-center p-3 bg-white border border-gray-200 rounded-xl hover:border-pp-300">
          <div class="text-2xl">📅</div>
          <div class="text-xs text-gray-600 mt-1">赛程</div>
        </a>
        <a href="/stats" class="text-center p-3 bg-white border border-gray-200 rounded-xl hover:border-pp-300">
          <div class="text-2xl">📊</div>
          <div class="text-xs text-gray-600 mt-1">统计</div>
        </a>
        <a href="/my" class="text-center p-3 bg-white border border-gray-200 rounded-xl hover:border-pp-300">
          <div class="text-2xl">🏓</div>
          <div class="text-xs text-gray-600 mt-1">我的</div>
        </a>
      </div>
    </div>
  </Layout>
);
