import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

export const MatchDetailPage: FC<{
  match: { id: number; time: string; table_no: number; event: string; status: string; confirmed: boolean };
  p1: { name: string; team: string };
  p2: { name: string; team: string };
  games: { game: number; s1: number; s2: number }[];
  history: { date: string; score: string; winner: string }[];
}> = ({ match, p1, p2, games, history }) => {
  const s1 = games.filter(g => g.s1 > g.s2).length;
  const s2 = games.filter(g => g.s2 > g.s1).length;

  return (
    <Layout title={`${p1.name} vs ${p2.name}`}>
      <Nav current="/live" />
      <div class="max-w-2xl mx-auto px-4 py-6 fade-in">
        {/* 比分头部 */}
        <div class="bg-gradient-to-r from-pp-500 to-pp-600 rounded-2xl p-6 text-white mb-6">
          <div class="text-center text-sm opacity-80 mb-2">{match.event}</div>
          <div class="flex items-center justify-center gap-8">
            <div class="text-center">
              <div class="text-2xl font-bold">{p1.name}</div>
              <div class="text-sm opacity-70">{p1.team || '个人'}</div>
            </div>
            <div class="text-center">
              <div class="text-5xl font-bold">{s1} : {s2}</div>
              <div class="text-xs opacity-60 mt-1">{match.time} · {match.table_no}号台</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">{p2.name}</div>
              <div class="text-sm opacity-70">{p2.team || '个人'}</div>
            </div>
          </div>
          {match.status === 'finished' && (
            <div class="text-center mt-4">
              <span class={`px-3 py-1 rounded-full text-sm ${match.confirmed ? 'bg-green-500' : 'bg-yellow-500'}`}>
                {match.confirmed ? '✓ 已确认' : '待确认'}
              </span>
            </div>
          )}
        </div>

        {/* 局分详情 */}
        {games.length > 0 && (
          <Card title="局分详情" class="mb-4">
            <div class="grid grid-cols-7 gap-2 text-center">
              {games.map(g => (
                <div class={`p-2 rounded ${g.s1 > g.s2 ? 'bg-green-100' : g.s2 > g.s1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <div class="text-xs text-gray-500">第{g.game}局</div>
                  <div class="font-bold">{g.s1}:{g.s2}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 历史交锋 */}
        {history.length > 0 && (
          <Card title="历史交锋">
            <div class="space-y-2">
              {history.map(h => (
                <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-sm">
                  <span class="text-gray-400">{h.date}</span>
                  <span>{h.score}</span>
                  <span class="text-green-600">{h.winner} 胜</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div class="mt-4 text-center">
          <a href="/live" class="text-pp-600 hover:underline">← 返回实时比分</a>
        </div>
      </div>
    </Layout>
  );
};
