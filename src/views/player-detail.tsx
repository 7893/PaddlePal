import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

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
  const winRate = stats.played > 0 ? Math.round(stats.wins / stats.played * 100) : 0;

  return (
    <Layout title={`${player.name} - 选手详情`}>
      <Nav current="/players" />
      <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-pp-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-3xl">🏓</span>
          </div>
          <h2 class="text-xl font-bold text-gray-800">{player.name}</h2>
          <p class="text-sm text-gray-500">{player.team || '个人参赛'}</p>
          {player.rating > 0 && <p class="text-pp-600 font-medium mt-1">积分: {player.rating}</p>}
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div class="text-2xl font-bold text-gray-800">{stats.played}</div>
            <div class="text-xs text-gray-500">总场次</div>
          </div>
          <div class="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div class="text-2xl font-bold text-green-600">{stats.wins}</div>
            <div class="text-xs text-gray-500">胜场</div>
          </div>
          <div class="bg-white rounded-xl p-4 text-center border border-gray-200">
            <div class="text-2xl font-bold text-pp-600">{winRate}%</div>
            <div class="text-xs text-gray-500">胜率</div>
          </div>
        </div>

        {recentMatches.length > 0 && (
          <Card title="最近比赛" class="mb-4">
            <div class="space-y-2">
              {recentMatches.slice(0, 10).map(m => (
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span class="text-gray-400 text-xs">{m.date}</span>
                    <span class="ml-2">vs {m.opponent}</span>
                  </div>
                  <div class={m.won ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {m.won ? '胜' : '负'} {m.score}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {headToHead.length > 0 && (
          <Card title="对战记录">
            <div class="space-y-2">
              {headToHead.slice(0, 10).map(h => (
                <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span class="font-medium">{h.opponent}</span>
                  <div>
                    <span class="text-green-600">{h.wins}胜</span>
                    <span class="mx-1 text-gray-400">/</span>
                    <span class="text-red-600">{h.losses}负</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};
