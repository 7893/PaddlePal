import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer } from '../components/layout';

type Match = { id: number; round: number; pos: number; p1: string; p2: string; score1: number; score2: number; winner: number };

export const EliminationBracket: FC<{ title: string; matches: Match[]; rounds: number }> = ({ title, matches, rounds }) => {
  const byRound: Record<number, Match[]> = {};
  for (let r = 1; r <= rounds; r++) byRound[r] = matches.filter(m => m.round === r).sort((a, b) => a.pos - b.pos);

  const getRoundName = (r: number, total: number) => {
    if (r === total) return '🏆 决赛';
    if (r === total - 1) return '半决赛';
    if (r === total - 2) return '1/4决赛';
    return `第${r}轮`;
  };

  return (
    <Layout title={`淘汰赛 - ${title}`}>
      <Nav current="/bracket" title={`${title} · 淘汰赛对阵`} />
      <PageWrapper>
        <div class="overflow-x-auto pb-4">
          <div class="flex gap-10 min-w-max">
            {Array.from({ length: rounds }, (_, i) => i + 1).map(round => (
              <div class="flex flex-col" style={`padding-top: ${Math.pow(2, round - 1) * 24}px`}>
                <div class="text-center text-sm font-semibold text-slate-500 mb-5">{getRoundName(round, rounds)}</div>
                <div class="space-y-4" style={`gap: ${Math.pow(2, round) * 24}px`}>
                  {(byRound[round] || []).map(m => (
                    <div class={`w-52 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${m.winner ? 'border-2 border-emerald-400' : 'border border-slate-200'}`}>
                      <div class={`px-4 py-3 flex justify-between items-center ${m.winner === 1 ? 'bg-emerald-50' : 'bg-white'}`}>
                        <span class={`truncate ${m.winner === 1 ? 'font-semibold text-emerald-700' : 'text-slate-700'}`}>{m.p1 || 'TBD'}</span>
                        <span class={`font-bold ${m.winner === 1 ? 'text-emerald-600' : 'text-slate-400'}`}>{m.score1 ?? '-'}</span>
                      </div>
                      <div class="border-t border-slate-100"></div>
                      <div class={`px-4 py-3 flex justify-between items-center ${m.winner === 2 ? 'bg-emerald-50' : 'bg-white'}`}>
                        <span class={`truncate ${m.winner === 2 ? 'font-semibold text-emerald-700' : 'text-slate-700'}`}>{m.p2 || 'TBD'}</span>
                        <span class={`font-bold ${m.winner === 2 ? 'text-emerald-600' : 'text-slate-400'}`}>{m.score2 ?? '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
