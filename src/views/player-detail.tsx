import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type HeadToHead = {
  opponent: string;
  wins: number;
  losses: number;
  matches: { date: string; score: string; won: boolean }[];
};

export const PlayerDetailPage: FC<{
  player: { id: number; name: string; team: string; rating: number };
  stats: { played: number; wins: number; losses: number };
  headToHead: HeadToHead[];
  recentMatches: { date: string; opponent: string; score: string; won: boolean }[];
}> = ({ player, stats, headToHead, recentMatches }) => {
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <Layout title={`${player.name} - 选手详情`}>
      <Nav current="/players" title="选手详情" />
      <PageWrapper>
        <div class="max-w-3xl mx-auto">
          {/* Player header */}
          <div class="text-center mb-8">
            <div class="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <span class="text-4xl">🏓</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">{player.name}</h2>
            <p class="text-slate-500 mt-1">{player.team || '个人参赛'}</p>
            {player.rating > 0 && <p class="text-emerald-600 font-semibold mt-2">积分: {player.rating}</p>}
          </div>

          {/* Stats */}
          <div class="grid grid-cols-3 gap-5 mb-8">
            <div class="bg-white rounded-2xl p-5 text-center border border-slate-200">
              <div class="text-3xl font-bold text-slate-800">{stats.played}</div>
              <div class="text-sm text-slate-500 mt-1">总场次</div>
            </div>
            <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-emerald-500/25">
              <div class="text-3xl font-bold">{stats.wins}</div>
              <div class="text-sm text-emerald-100 mt-1">胜场</div>
            </div>
            <div class="bg-white rounded-2xl p-5 text-center border border-slate-200">
              <div class="text-3xl font-bold text-emerald-600">{winRate}%</div>
              <div class="text-sm text-slate-500 mt-1">胜率</div>
            </div>
          </div>

          {/* Recent matches */}
          {recentMatches.length > 0 && (
            <Card title="最近比赛" class="mb-6">
              <div class="space-y-2">
                {recentMatches.slice(0, 10).map((m) => (
                  <div class="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                    <div>
                      <span class="text-slate-400 text-sm">{m.date}</span>
                      <span class="ml-3 font-medium text-slate-700">vs {m.opponent}</span>
                    </div>
                    <div
                      class={`px-3 py-1 rounded-lg text-sm font-medium ${m.won ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {m.won ? '胜' : '负'} {m.score}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Head to head */}
          {headToHead.length > 0 && (
            <Card title="对战记录">
              <div class="space-y-2">
                {headToHead.slice(0, 10).map((h) => (
                  <div class="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                    <span class="font-semibold text-slate-800">{h.opponent}</span>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                        {h.wins}胜
                      </span>
                      <span class="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{h.losses}负</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
