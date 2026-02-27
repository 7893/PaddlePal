import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, EmptyState } from '../components/layout';
import { RankBadge, ProgressBar } from '../components/match';

type Team = { id: number; name: string; players: number; wins: number; played: number };

export const TeamRankingPage: FC<{ teams: Team[] }> = ({ teams }) => (
  <Layout title="队伍排名">
    <Nav current="/team-ranking" title="队伍排名" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <Card>
          {teams.length > 0 ? (
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500">
                  <th class="py-4 text-left font-semibold w-16">#</th>
                  <th class="py-4 text-left font-semibold">队伍</th>
                  <th class="py-4 text-center font-semibold">人数</th>
                  <th class="py-4 text-center font-semibold">总胜场</th>
                  <th class="py-4 text-center font-semibold">总场次</th>
                  <th class="py-4 font-semibold w-40">胜率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {teams.map((t, i) => (
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-4">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td class="py-4 font-semibold text-slate-800">{t.name}</td>
                    <td class="py-4 text-center text-slate-500">{t.players}</td>
                    <td class="py-4 text-center text-emerald-600 font-bold">{t.wins}</td>
                    <td class="py-4 text-center text-slate-500">{t.played}</td>
                    <td class="py-4">
                      <ProgressBar value={t.wins} max={t.played} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon="🏅" title="暂无队伍数据" />
          )}
        </Card>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
