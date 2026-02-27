import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge, PageWrapper, Footer } from '../components/layout';

type EventSummary = { key: string; title: string; type: string; stage: string; finish: number; plays: number };
type GroupRank = { group: string; rows: [number, string, string][] };
type CrossGroup = { name: string; header: string[]; rows: { player: [number, string, string]; cells: string[]; points: number; rank: number }[] };

export const ResultsListPage: FC<{ events: EventSummary[]; info: string }> = ({ events, info: _info }) => (
  <Layout title="成绩">
    <Nav current="/results" title="比赛成绩" />
    <PageWrapper>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(ev => {
          const pct = ev.plays > 0 ? Math.round(ev.finish / ev.plays * 100) : 0;
          return (
            <a href={`/results/${ev.key}`} class="block bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-800">{ev.title}</h3>
                <Badge color={ev.stage === 'loop' ? 'blue' : 'yellow'}>
                  {ev.stage === 'loop' ? '循环赛' : '淘汰赛'}
                </Badge>
              </div>
              <div class="flex justify-between text-sm text-slate-500 mb-2">
                <span>完成 {ev.finish} / {ev.plays} 场</span>
                <span class="font-medium text-slate-700">{pct}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full" style={`width:${pct}%`}></div>
              </div>
            </a>
          );
        })}
        {events.length === 0 && (
          <div class="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <div class="text-5xl mb-4 opacity-50">🏆</div>
            <p class="text-slate-400">暂无比赛成绩</p>
          </div>
        )}
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);

export const ResultsDetailPage: FC<{
  title: string; stage: string; ranks: GroupRank[]; crosses: CrossGroup[];
}> = ({ title, stage, ranks, crosses }) => (
  <Layout title={title}>
    <Nav current="/results" title={title} />
    <PageWrapper>
      <div class="flex items-center gap-3 mb-6">
        <a href="/results" class="text-slate-400 hover:text-slate-600 transition-colors">← 返回</a>
        <Badge color={stage === 'loop' ? 'blue' : 'yellow'}>{stage === 'loop' ? '循环赛' : '淘汰赛'}</Badge>
      </div>

      {/* Rankings */}
      {ranks.length > 0 && (
        <div class="mb-8">
          <h3 class="font-semibold text-slate-800 mb-4">🥇 排名</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ranks.map(g => (
              <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="px-5 py-3 bg-slate-50 font-semibold text-sm text-slate-600">{g.group}</div>
                <table class="w-full text-sm">
                  <tbody class="divide-y divide-slate-100">
                    {g.rows.map(r => (
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-5 py-3 w-14">
                          {r[0] === 1 ? (
                            <span class="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold">1</span>
                          ) : r[0] === 2 ? (
                            <span class="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold">2</span>
                          ) : r[0] === 3 ? (
                            <span class="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">3</span>
                          ) : (
                            <span class="text-slate-400 pl-2">{r[0]}</span>
                          )}
                        </td>
                        <td class="px-5 py-3 font-semibold text-slate-800">{r[1]}</td>
                        <td class="px-5 py-3 text-slate-500">{r[2]}</td>
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
          <h3 class="font-semibold text-slate-800 mb-4">📊 交叉表</h3>
          {crosses.map(g => (
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5">
              <div class="px-5 py-3 bg-slate-50 font-semibold text-sm text-slate-600">{g.name}</div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-3 py-2 text-left text-slate-500 font-semibold sticky left-0 bg-slate-50">选手</th>
                      <th class="px-3 py-2 text-left text-slate-500 font-semibold">队伍</th>
                      {g.header.map(h => <th class="px-3 py-2 text-center text-slate-500 font-semibold w-14">{h}</th>)}
                      <th class="px-3 py-2 text-center text-slate-500 font-semibold">积分</th>
                      <th class="px-3 py-2 text-center text-slate-500 font-semibold">名次</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    {g.rows.map((r, i) => (
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-3 py-2 font-semibold text-slate-800 sticky left-0 bg-white whitespace-nowrap">{r.player[0]}. {r.player[1]}</td>
                        <td class="px-3 py-2 text-slate-500 whitespace-nowrap">{r.player[2]}</td>
                        {r.cells.map((cell, j) => (
                          <td class={`px-3 py-2 text-center ${i === j ? 'bg-slate-100' : ''}`}>
                            <span dangerouslySetInnerHTML={{ __html: cell || (i === j ? '×' : '') }} />
                          </td>
                        ))}
                        <td class="px-3 py-2 text-center font-bold text-slate-700">{r.points}</td>
                        <td class="px-3 py-2 text-center">
                          {r.rank === 1 ? (
                            <span class="w-6 h-6 rounded-full bg-amber-400 inline-flex items-center justify-center text-white text-xs font-bold">1</span>
                          ) : r.rank === 2 ? (
                            <span class="w-6 h-6 rounded-full bg-slate-400 inline-flex items-center justify-center text-white text-xs font-bold">2</span>
                          ) : r.rank > 0 ? r.rank : '-'}
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
    </PageWrapper>
    <Footer />
  </Layout>
);
