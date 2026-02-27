import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';
import { StatCard } from '../components/match';

export const DashboardPage: FC<{
  stats: {
    players: number;
    teams: number;
    total_matches: number;
    finished: number;
    playing: number;
    scheduled: number;
  };
  recentResults: { id: number; p1: string; p2: string; score1: number; score2: number }[];
}> = ({ stats, recentResults }) => {
  const progress = stats.total_matches > 0 ? Math.round((stats.finished / stats.total_matches) * 100) : 0;

  return (
    <Layout title="仪表盘">
      <Nav current="/dashboard" title="赛事仪表盘" />
      <PageWrapper>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <StatCard label="参赛选手" value={stats.players} color="blue" />
          <StatCard label="参赛队伍" value={stats.teams} color="emerald" />
          <StatCard label="进行中" value={stats.playing} color="red" />
          <StatCard label="已完成" value={`${stats.finished}/${stats.total_matches}`} color="amber" />
        </div>

        <Card title="比赛进度" class="mb-6">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                style={`width:${progress}%`}
              ></div>
            </div>
            <span class="text-lg font-bold text-slate-700">{progress}%</span>
          </div>
          <div class="flex justify-between text-sm text-slate-500">
            <span>✅ 已完成 {stats.finished}</span>
            <span>🔴 进行中 {stats.playing}</span>
            <span>⏳ 待赛 {stats.scheduled}</span>
          </div>
        </Card>

        <Card title="最新成绩" class="mb-6">
          <div class="space-y-2">
            {recentResults.map((r) => (
              <a
                href={`/match/${r.id}`}
                class="flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span class={`font-medium ${r.score1 > r.score2 ? 'text-emerald-600' : 'text-slate-700'}`}>{r.p1}</span>
                <span class="text-xl font-bold text-slate-800">
                  {r.score1} : {r.score2}
                </span>
                <span class={`font-medium ${r.score2 > r.score1 ? 'text-emerald-600' : 'text-slate-700'}`}>{r.p2}</span>
              </a>
            ))}
            {recentResults.length === 0 && <div class="text-center py-6 text-slate-400">暂无成绩</div>}
          </div>
        </Card>

        <div class="grid grid-cols-4 gap-4">
          {[
            { href: '/live', icon: '📺', label: '实时比分' },
            { href: '/schedule', icon: '📅', label: '赛程' },
            { href: '/stats', icon: '📊', label: '统计' },
            { href: '/my', icon: '🏓', label: '我的' },
          ].map((item) => (
            <a
              href={item.href}
              class="text-center p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-slate-300 transition-all group"
            >
              <div class="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
              <div class="text-sm text-slate-600 mt-2 font-medium">{item.label}</div>
            </a>
          ))}
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
