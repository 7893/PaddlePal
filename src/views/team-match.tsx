import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type Rubber = { pid: number; order: number; p1: string; p2: string; result: string; status: string; winner: number };
type TeamMatch = {
  id: number; match_order: number; time: string; table_no: number; status: string; result: string;
  team1: string; team2: string; t1_short: string; t2_short: string; event: string;
  score1: number; score2: number; rubbers: Rubber[];
};

export const TeamMatchPage: FC<{ event: string; matches: TeamMatch[]; eventKey?: string }> = ({ event, matches, eventKey }) => (
  <Layout title={`团体赛 - ${event}`}>
    <Nav current="/schedule" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">🏓 {event}</h2>
          <p class="text-sm text-gray-500 mt-1">团体赛对阵</p>
        </div>
        {eventKey && <a href={`/results/${eventKey}`} class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">📋 成绩表</a>}
      </div>

      {matches.length === 0 ? (
        <div class="text-center py-16">
          <div class="text-4xl mb-4 opacity-40">🏓</div>
          <p class="text-gray-400">暂无团体赛比赛</p>
        </div>
      ) : (
        <div class="space-y-6">
          {matches.map(m => (
            <div class={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
              m.status === 'playing' ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-200'
            }`}>
              {/* Team header */}
              <div class="bg-gradient-to-r from-slate-50 to-white p-5">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs text-gray-400">#{m.match_order} · {m.table_no}号台 · {m.time}</span>
                  <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                    {m.status === 'finished' ? '已完赛' : m.status === 'playing' ? '进行中' : '待比赛'}
                  </Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex-1 text-center">
                    <div class={`text-2xl font-bold ${m.score1 > m.score2 ? 'text-emerald-600' : 'text-gray-800'}`}>
                      {m.team1}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">{m.t1_short}</div>
                  </div>
                  <div class="px-6">
                    <div class="flex items-center gap-3">
                      <span class={`text-4xl font-bold tabular-nums ${m.score1 > m.score2 ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {m.score1}
                      </span>
                      <span class="text-gray-300 text-2xl">:</span>
                      <span class={`text-4xl font-bold tabular-nums ${m.score2 > m.score1 ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {m.score2}
                      </span>
                    </div>
                    {m.result && <div class="text-xs text-gray-400 text-center mt-1">{m.result}</div>}
                  </div>
                  <div class="flex-1 text-center">
                    <div class={`text-2xl font-bold ${m.score2 > m.score1 ? 'text-emerald-600' : 'text-gray-800'}`}>
                      {m.team2}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">{m.t2_short}</div>
                  </div>
                </div>
              </div>

              {/* Rubbers */}
              {m.rubbers.length > 0 && (
                <div class="border-t border-gray-100">
                  <table class="w-full text-sm">
                    <tbody>
                      {m.rubbers.map((r, i) => (
                        <tr class={`border-b border-gray-50 last:border-0 ${
                          r.status === 'playing' ? 'bg-red-50' : 'hover:bg-gray-50'
                        }`}>
                          <td class="py-3 pl-5 w-10">
                            <span class={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              r.status === 'finished' 
                                ? r.winner === 1 ? 'bg-blue-100 text-blue-600' : r.winner === 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td class={`py-3 ${r.winner === 1 ? 'font-bold text-emerald-600' : 'text-gray-700'}`}>
                            {r.p1}
                          </td>
                          <td class="py-3 text-center w-24">
                            <a href={`/score/${r.pid}`} class="font-mono text-gray-600 hover:text-pp-600 hover:underline">
                              {r.result || '-'}
                            </a>
                          </td>
                          <td class={`py-3 text-right ${r.winner === 2 ? 'font-bold text-emerald-600' : 'text-gray-700'}`}>
                            {r.p2}
                          </td>
                          <td class="py-3 pr-5 w-16 text-right">
                            {r.status === 'playing' ? (
                              <span class="inline-flex items-center gap-1 text-xs text-red-500">
                                <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                进行
                              </span>
                            ) : r.status === 'finished' ? (
                              <span class="text-xs text-emerald-500">✓</span>
                            ) : (
                              <a href={`/score/${r.pid}`} class="text-xs text-pp-600 hover:underline">记分</a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </Layout>
);

// Team match order configuration (CTTA standard)
export const TeamOrderConfig: FC<{ format: string }> = ({ format }) => {
  const orders: Record<string, string[][]> = {
    '5singles': [['A', 'X'], ['B', 'Y'], ['C', 'Z'], ['A', 'Y'], ['B', 'X']],
    '5mixed': [['XY', 'AB'], ['C', 'Z'], ['A', 'Y'], ['B', 'X'], ['XY', 'AB']],
    'swaythling': [['A', 'X'], ['B', 'Y'], ['D', 'W'], ['A', 'Y'], ['C', 'Z'], ['D', 'X'], ['B', 'W'], ['C', 'X'], ['A', 'Z']],
    'corbillon': [['A', 'X'], ['B', 'Y'], ['AB', 'XY'], ['A', 'Y'], ['B', 'X']],
  };
  const order = orders[format] || orders['5singles'];
  
  return (
    <div class="bg-slate-50 rounded-lg p-4">
      <div class="text-xs text-slate-500 mb-2">出场顺序</div>
      <div class="flex gap-2 flex-wrap">
        {order.map((pair, i) => (
          <div class="flex items-center gap-1 bg-white rounded px-2 py-1 text-sm">
            <span class="text-slate-400">{i + 1}.</span>
            <span class="text-blue-600">{pair[0]}</span>
            <span class="text-slate-300">vs</span>
            <span class="text-red-600">{pair[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
