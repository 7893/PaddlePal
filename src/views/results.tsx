import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge } from '../components/layout';

type EventSummary = { key: string; title: string; type: string; stage: string; finish: number; plays: number };
type GroupRank = { group: string; rows: [number, string, string][] };
type CrossGroup = { name: string; header: string[]; rows: { player: [number, string, string]; cells: string[]; points: number; rank: number }[] };

export const ResultsListPage: FC<{ events: EventSummary[]; info: string }> = ({ events, info }) => (
  <Layout title="成绩">
    <Nav current="/results" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">🏆 比赛成绩 · {info}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(ev => (
          <a href={`/results/${ev.key}`} class="block">
            <Card>
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-800">{ev.title}</h3>
                <Badge color={ev.stage === 'loop' ? 'blue' : 'yellow'}>
                  {ev.stage === 'loop' ? '循环赛' : '淘汰赛'}
                </Badge>
              </div>
              <div class="text-sm text-gray-500">{ev.finish}/{ev.plays} 场已完赛</div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  </Layout>
);

export const ResultsDetailPage: FC<{
  title: string; stage: string; ranks: GroupRank[]; crosses: CrossGroup[];
}> = ({ title, stage, ranks, crosses }) => (
  <Layout title={title}>
    <Nav current="/results" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center gap-3 mb-6">
        <a href="/results" class="text-gray-400 hover:text-gray-600">← 返回</a>
        <h2 class="text-lg font-bold text-gray-800">{title}</h2>
        <Badge color={stage === 'loop' ? 'blue' : 'yellow'}>{stage === 'loop' ? '循环赛' : '淘汰赛'}</Badge>
      </div>

      {/* Rankings */}
      {ranks.length > 0 && (
        <div class="mb-8">
          <h3 class="font-medium text-gray-700 mb-3">🥇 排名</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ranks.map(g => (
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-600">{g.group}</div>
                <table class="w-full text-sm">
                  <tbody class="divide-y divide-gray-100">
                    {g.rows.map(r => (
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 w-12">
                          {r[0] === 1 ? <span class="text-yellow-500">🥇</span> : r[0] === 2 ? <span class="text-gray-400">🥈</span> : r[0] === 3 ? <span class="text-amber-600">🥉</span> : <span class="text-gray-400">{r[0]}</span>}
                        </td>
                        <td class="px-4 py-2 font-medium text-gray-800">{r[1]}</td>
                        <td class="px-4 py-2 text-gray-500">{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross tables */}
      {crosses.length > 0 && (
        <div>
          <h3 class="font-medium text-gray-700 mb-3">📊 交叉表</h3>
          {crosses.map(g => (
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
              <div class="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-600">{g.name}</div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="px-2 py-1 text-left text-gray-500 font-medium sticky left-0 bg-gray-50">选手</th>
                      <th class="px-2 py-1 text-left text-gray-500 font-medium">队伍</th>
                      {g.header.map(h => <th class="px-2 py-1 text-center text-gray-500 font-medium w-12">{h}</th>)}
                      <th class="px-2 py-1 text-center text-gray-500 font-medium">积分</th>
                      <th class="px-2 py-1 text-center text-gray-500 font-medium">名次</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    {g.rows.map((r, i) => (
                      <tr class="hover:bg-gray-50">
                        <td class="px-2 py-1 font-medium text-gray-800 sticky left-0 bg-white whitespace-nowrap">{r.player[0]}. {r.player[1]}</td>
                        <td class="px-2 py-1 text-gray-500 whitespace-nowrap">{r.player[2]}</td>
                        {r.cells.map((cell, j) => (
                          <td class={`px-2 py-1 text-center ${i === j ? 'bg-gray-100' : ''}`}>
                            <span dangerouslySetInnerHTML={{ __html: cell || (i === j ? '×' : '') }} />
                          </td>
                        ))}
                        <td class="px-2 py-1 text-center font-bold text-gray-700">{r.points}</td>
                        <td class="px-2 py-1 text-center">
                          {r.rank === 1 ? <span class="text-yellow-500 font-bold">1</span> : r.rank === 2 ? <span class="text-gray-500 font-bold">2</span> : r.rank > 0 ? r.rank : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </Layout>
);
