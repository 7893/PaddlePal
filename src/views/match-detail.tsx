import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

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
      <Nav current="/live" title="比赛详情" />
      <PageWrapper>
        <div class="max-w-2xl mx-auto">
          {/* Score header */}
          <div class="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 20px 20px;"></div>
            <div class="relative">
              <div class="text-center text-sm text-emerald-300 mb-4">{match.event}</div>
              <div class="flex items-center justify-center gap-10">
                <div class="text-center flex-1">
                  <div class="text-2xl font-bold">{p1.name}</div>
                  <div class="text-sm text-white/60 mt-1">{p1.team || '个人'}</div>
                </div>
                <div class="text-center">
                  <div class="text-6xl font-bold">{s1} : {s2}</div>
                  <div class="text-sm text-white/50 mt-2">{match.time} · {match.table_no}号台</div>
                </div>
                <div class="text-center flex-1">
                  <div class="text-2xl font-bold">{p2.name}</div>
                  <div class="text-sm text-white/60 mt-1">{p2.team || '个人'}</div>
                </div>
              </div>
              {match.status === 'finished' && (
                <div class="text-center mt-6">
                  <span class={`px-4 py-1.5 rounded-full text-sm font-medium ${match.confirmed ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'}`}>
                    {match.confirmed ? '✓ 已确认' : '待确认'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Game scores */}
          {games.length > 0 && (
            <Card title="局分详情" class="mb-6">
              <div class="grid grid-cols-7 gap-3 text-center">
                {games.map(g => (
                  <div class={`p-3 rounded-xl ${g.s1 > g.s2 ? 'bg-emerald-100 border-2 border-emerald-300' : g.s2 > g.s1 ? 'bg-red-100 border-2 border-red-300' : 'bg-slate-100'}`}>
                    <div class="text-xs text-slate-500 mb-1">第{g.game}局</div>
                    <div class="font-bold text-lg">{g.s1}:{g.s2}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card title="历史交锋">
              <div class="space-y-3">
                {history.map(h => (
                  <div class="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl">
                    <span class="text-slate-400">{h.date}</span>
                    <span class="font-medium">{h.score}</span>
                    <span class="text-emerald-600 font-medium">{h.winner} 胜</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div class="mt-6 text-center">
            <a href="/live" class="text-emerald-600 hover:text-emerald-700 font-medium">← 返回实时比分</a>
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
