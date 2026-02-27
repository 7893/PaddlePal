import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Team = { id: number; name: string; players: number; wins: number; played: number };

export const TeamRankingPage: FC<{ teams: Team[] }> = ({ teams }) => (
  <Layout title="队伍排名">
    <Nav current="/team-ranking" title="队伍排名" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <Card>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500">
                  <th class="py-4 text-left font-semibold w-16">#</th>
                  <th class="py-4 text-left font-semibold">队伍</th>
                  <th class="py-4 text-center font-semibold">人数</th>
                  <th class="py-4 text-center font-semibold">总胜场</th>
                  <th class="py-4 text-center font-semibold">总场次</th>
                  <th class="py-4 text-center font-semibold">胜率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {teams.map((t, i) => {
                  const rate = t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0;
                  return (
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-4">
                        {i < 3 ? (
                          <span
                            class={`w-8 h-8 rounded-full inline-flex items-center justify-center text-white text-sm font-bold ${
                              i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-amber-600'
                            }`}
                          >
                            {i + 1}
                          </span>
                        ) : (
                          <span class="text-slate-400 pl-2">{i + 1}</span>
                        )}
                      </td>
                      <td class="py-4 font-semibold text-slate-800">{t.name}</td>
                      <td class="py-4 text-center text-slate-500">{t.players}</td>
                      <td class="py-4 text-center text-emerald-600 font-bold">{t.wins}</td>
                      <td class="py-4 text-center text-slate-500">{t.played}</td>
                      <td class="py-4">
                        <div class="flex items-center justify-center gap-3">
                          <div class="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                              style={`width:${rate}%`}
                            ></div>
                          </div>
                          <span class="text-sm text-slate-500 w-12">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {teams.length === 0 && (
              <div class="text-center py-12 text-slate-400">
                <div class="text-4xl mb-3 opacity-50">🏅</div>
                <p>暂无队伍数据</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
