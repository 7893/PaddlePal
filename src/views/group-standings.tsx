import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Entry = { pos: number; name: string; played: number; wins: number; losses: number; gf: number; ga: number; points: number };

export const GroupStandings: FC<{ title: string; groups: { name: string; entries: Entry[] }[] }> = ({ title, groups }) => (
  <Layout title={`小组积分 - ${title}`}>
    <Nav current="/standings" title={`${title} · 小组积分榜`} />
    <PageWrapper>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(g => (
          <Card title={g.name}>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500">
                    <th class="py-3 text-left font-semibold w-10">#</th>
                    <th class="py-3 text-left font-semibold">选手</th>
                    <th class="py-3 text-center font-semibold">场</th>
                    <th class="py-3 text-center font-semibold">胜</th>
                    <th class="py-3 text-center font-semibold">负</th>
                    <th class="py-3 text-center font-semibold">局</th>
                    <th class="py-3 text-center font-semibold">分</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {g.entries.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)).map((e, i) => (
                    <tr class={`${i < 2 ? 'bg-emerald-50' : ''} hover:bg-slate-50 transition-colors`}>
                      <td class="py-3">
                        {i < 2 ? (
                          <span class={`w-6 h-6 rounded-full inline-flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-amber-400' : 'bg-slate-400'}`}>{i + 1}</span>
                        ) : (
                          <span class="text-slate-400 pl-1">{i + 1}</span>
                        )}
                      </td>
                      <td class="py-3 font-semibold text-slate-800">{e.name}</td>
                      <td class="py-3 text-center text-slate-600">{e.played}</td>
                      <td class="py-3 text-center text-emerald-600 font-medium">{e.wins}</td>
                      <td class="py-3 text-center text-red-500">{e.losses}</td>
                      <td class="py-3 text-center text-slate-500">{e.gf}:{e.ga}</td>
                      <td class="py-3 text-center font-bold text-emerald-600">{e.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      <div class="mt-6 text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
          <span class="w-3 h-3 bg-emerald-200 rounded"></span> 晋级区
        </span>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
