import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge, PageWrapper, Footer } from '../components/layout';

type Rubber = { pid: number; order: number; p1: string; p2: string; result: string; status: string; winner: number };
type TeamMatch = {
  id: number;
  match_order: number;
  time: string;
  table_no: number;
  status: string;
  result: string;
  team1: string;
  team2: string;
  t1_short: string;
  t2_short: string;
  event: string;
  score1: number;
  score2: number;
  rubbers: Rubber[];
};

export const TeamMatchPage: FC<{ event: string; matches: TeamMatch[]; eventKey?: string }> = ({
  event,
  matches,
  eventKey,
}) => (
  <Layout title={`团体赛 - ${event}`}>
    <Nav current="/schedule" title={`团体赛 · ${event}`} />
    <PageWrapper>
      <div class="flex items-center justify-between mb-6">
        <p class="text-slate-500">共 {matches.length} 场团体赛</p>
        {eventKey && (
          <a
            href={`/results/${eventKey}`}
            class="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            📋 成绩表
          </a>
        )}
      </div>

      {matches.length === 0 ? (
        <div class="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div class="text-5xl mb-4 opacity-40">🏓</div>
          <p class="text-slate-400">暂无团体赛比赛</p>
        </div>
      ) : (
        <div class="space-y-6">
          {matches.map((m) => (
            <div
              class={`bg-white rounded-2xl border overflow-hidden ${m.status === 'playing' ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'}`}
            >
              <div class="bg-gradient-to-r from-slate-50 to-white p-6">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-slate-400">
                    #{m.match_order} · {m.table_no}号台 · {m.time}
                  </span>
                  <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                    {m.status === 'finished' ? '已完赛' : m.status === 'playing' ? '进行中' : '待比赛'}
                  </Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex-1 text-center">
                    <div class={`text-2xl font-bold ${m.score1 > m.score2 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {m.team1}
                    </div>
                    <div class="text-xs text-slate-400 mt-1">{m.t1_short}</div>
                  </div>
                  <div class="px-8">
                    <div class="flex items-center gap-4">
                      <span
                        class={`text-5xl font-bold tabular-nums ${m.score1 > m.score2 ? 'text-emerald-600' : 'text-slate-700'}`}
                      >
                        {m.score1}
                      </span>
                      <span class="text-slate-300 text-3xl">:</span>
                      <span
                        class={`text-5xl font-bold tabular-nums ${m.score2 > m.score1 ? 'text-emerald-600' : 'text-slate-700'}`}
                      >
                        {m.score2}
                      </span>
                    </div>
                    {m.result && <div class="text-xs text-slate-400 text-center mt-2">{m.result}</div>}
                  </div>
                  <div class="flex-1 text-center">
                    <div class={`text-2xl font-bold ${m.score2 > m.score1 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {m.team2}
                    </div>
                    <div class="text-xs text-slate-400 mt-1">{m.t2_short}</div>
                  </div>
                </div>
              </div>

              {m.rubbers.length > 0 && (
                <div class="border-t border-slate-100">
                  <table class="w-full text-sm">
                    <tbody>
                      {m.rubbers.map((r, i) => (
                        <tr
                          class={`border-b border-slate-50 last:border-0 ${r.status === 'playing' ? 'bg-red-50' : 'hover:bg-slate-50'} transition-colors`}
                        >
                          <td class="py-3 pl-6 w-10">
                            <span
                              class={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                                r.status === 'finished'
                                  ? r.winner === 1
                                    ? 'bg-blue-100 text-blue-600'
                                    : r.winner === 2
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-slate-100 text-slate-500'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td class={`py-3 ${r.winner === 1 ? 'font-bold text-emerald-600' : 'text-slate-700'}`}>
                            {r.p1}
                          </td>
                          <td class="py-3 text-center w-28">
                            <a href={`/score/${r.pid}`} class="font-mono text-slate-600 hover:text-emerald-600">
                              {r.result || '-'}
                            </a>
                          </td>
                          <td
                            class={`py-3 text-right ${r.winner === 2 ? 'font-bold text-emerald-600' : 'text-slate-700'}`}
                          >
                            {r.p2}
                          </td>
                          <td class="py-3 pr-6 w-16 text-right">
                            {r.status === 'playing' ? (
                              <span class="inline-flex items-center gap-1 text-xs text-red-500">
                                <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>进行
                              </span>
                            ) : r.status === 'finished' ? (
                              <span class="text-emerald-500">✓</span>
                            ) : (
                              <a href={`/score/${r.pid}`} class="text-xs text-emerald-600 hover:underline">
                                记分
                              </a>
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
    </PageWrapper>
    <Footer />
  </Layout>
);

export const TeamOrderConfig: FC<{ format: string }> = ({ format }) => {
  const orders: Record<string, string[][]> = {
    '5singles': [
      ['A', 'X'],
      ['B', 'Y'],
      ['C', 'Z'],
      ['A', 'Y'],
      ['B', 'X'],
    ],
    '5mixed': [
      ['XY', 'AB'],
      ['C', 'Z'],
      ['A', 'Y'],
      ['B', 'X'],
      ['XY', 'AB'],
    ],
    swaythling: [
      ['A', 'X'],
      ['B', 'Y'],
      ['D', 'W'],
      ['A', 'Y'],
      ['C', 'Z'],
      ['D', 'X'],
      ['B', 'W'],
      ['C', 'X'],
      ['A', 'Z'],
    ],
    corbillon: [
      ['A', 'X'],
      ['B', 'Y'],
      ['AB', 'XY'],
      ['A', 'Y'],
      ['B', 'X'],
    ],
  };
  const order = orders[format] || orders['5singles'];
  return (
    <div class="bg-slate-50 rounded-xl p-4">
      <div class="text-xs text-slate-500 mb-2 font-medium">出场顺序</div>
      <div class="flex gap-2 flex-wrap">
        {order.map((pair, i) => (
          <div class="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 text-sm border border-slate-100">
            <span class="text-slate-400">{i + 1}.</span>
            <span class="text-blue-600 font-medium">{pair[0]}</span>
            <span class="text-slate-300">vs</span>
            <span class="text-red-600 font-medium">{pair[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
