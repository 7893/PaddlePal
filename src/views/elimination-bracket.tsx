import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type Match = { id: number; round: number; pos: number; p1: string; p2: string; score1: number; score2: number; winner: number };

export const EliminationBracket: FC<{ title: string; matches: Match[]; rounds: number }> = ({ title, matches, rounds }) => {
  const byRound: Record<number, Match[]> = {};
  for (let r = 1; r <= rounds; r++) byRound[r] = matches.filter(m => m.round === r).sort((a, b) => a.pos - b.pos);

  const getRoundName = (r: number, total: number) => {
    if (r === total) return '决赛';
    if (r === total - 1) return '半决赛';
    if (r === total - 2) return '1/4决赛';
    return `第${r}轮`;
  };

  return (
    <Layout title={`淘汰赛 - ${title}`}>
      <Nav current="/results" />
      <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
        <h2 class="text-lg font-bold text-gray-800 mb-6">🏆 {title} - 淘汰赛对阵</h2>
        
        <div class="overflow-x-auto">
          <div class="flex gap-8 min-w-max pb-4">
            {Array.from({ length: rounds }, (_, i) => i + 1).map(round => (
              <div class="flex flex-col" style={`padding-top: ${Math.pow(2, round - 1) * 20}px`}>
                <div class="text-center text-sm font-medium text-gray-500 mb-4">{getRoundName(round, rounds)}</div>
                <div class="space-y-4" style={`gap: ${Math.pow(2, round) * 20}px`}>
                  {(byRound[round] || []).map(m => (
                    <div class={`w-48 border rounded-lg overflow-hidden ${m.winner ? 'border-green-300' : 'border-gray-200'}`}>
                      <div class={`px-3 py-2 flex justify-between items-center ${m.winner === 1 ? 'bg-green-50 font-medium' : 'bg-white'}`}>
                        <span class="truncate">{m.p1 || 'TBD'}</span>
                        <span class={m.winner === 1 ? 'text-green-600 font-bold' : 'text-gray-400'}>{m.score1 ?? '-'}</span>
                      </div>
                      <div class="border-t border-gray-100"></div>
                      <div class={`px-3 py-2 flex justify-between items-center ${m.winner === 2 ? 'bg-green-50 font-medium' : 'bg-white'}`}>
                        <span class="truncate">{m.p2 || 'TBD'}</span>
                        <span class={m.winner === 2 ? 'text-green-600 font-bold' : 'text-gray-400'}>{m.score2 ?? '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
