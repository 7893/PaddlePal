import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type BMatch = { id: number; round: number; position: number; p1: string; p2: string; result: string; status: string; winner: number };

export const BracketPage: FC<{ title: string; rounds: BMatch[][]; maxRound: number }> = ({ title, rounds, maxRound }) => (
  <Layout title={`对阵图 - ${title}`}>
    <Nav current="/results" />
    <div class="max-w-full mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">🏆 淘汰赛对阵图 · {title}</h2>
      <div class="overflow-x-auto">
        <div class="flex gap-6 min-w-max">
          {rounds.map((ms, ri) => {
            const roundLabel = ri === maxRound - 1 ? '决赛' : ri === maxRound - 2 ? '半决赛' : `第${ri + 1}轮`;
            const gap = Math.pow(2, ri) * 60;
            return (
              <div class="flex flex-col items-center" style={`padding-top:${(gap - 60) / 2}px; gap:${gap - 60}px`}>
                <div class="text-xs text-gray-400 font-medium mb-2">{roundLabel}</div>
                {ms.map(m => (
                  <div class={`w-48 border rounded-lg overflow-hidden text-sm ${m.status === 'finished' ? 'border-gray-300' : 'border-gray-200'}`}>
                    <div class={`flex justify-between px-3 py-1.5 ${m.winner === 1 ? 'bg-green-50 font-bold text-green-800' : 'bg-white text-gray-700'}`}>
                      <span>{m.p1 || 'BYE'}</span>
                      {m.result && <span class="text-xs text-gray-400">{m.result.split(':')[0]}</span>}
                    </div>
                    <div class="border-t border-gray-100" />
                    <div class={`flex justify-between px-3 py-1.5 ${m.winner === 2 ? 'bg-green-50 font-bold text-green-800' : 'bg-white text-gray-700'}`}>
                      <span>{m.p2 || 'BYE'}</span>
                      {m.result && <span class="text-xs text-gray-400">{m.result.split(':')[1]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </Layout>
);
