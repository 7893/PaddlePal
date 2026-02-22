import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type PlayerStat = {
  id: number; name: string; team: string;
  played: number; wins: number; losses: number;
  games_won: number; games_lost: number;
};

type TeamStat = {
  name: string; players: number;
  total_played: number; total_wins: number;
};

export const StatsPage: FC<{ players: PlayerStat[]; teams: TeamStat[] }> = ({ players, teams }) => (
  <Layout title="统计报表">
    <Nav current="/stats" title="统计报表" />
    <PageWrapper>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player rankings */}
        <Card title="🏆 选手战绩排名">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-left text-slate-500">
                  <th class="py-3 font-semibold w-12">#</th>
                  <th class="py-3 font-semibold">选手</th>
                  <th class="py-3 font-semibold">队伍</th>
                  <th class="py-3 font-semibold">胜/负</th>
                  <th class="py-3 font-semibold">胜率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {players.slice(0, 20).map((p, i) => {
                  const rate = p.played > 0 ? Math.round(p.wins / p.played * 100) : 0;
                  return (
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3">
                        {i < 3 ? (
                          <span class={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-amber-600'}`}>
                            {i + 1}
                          </span>
                        ) : (
                          <span class="text-slate-400 pl-2">{i + 1}</span>
                        )}
                      </td>
                      <td class="py-3 font-semibold text-slate-800">{p.name}</td>
                      <td class="py-3 text-slate-500">{p.team || '-'}</td>
                      <td class="py-3">
                        <span class="text-emerald-600 font-medium">{p.wins}</span>
                        <span class="text-slate-300 mx-1">/</span>
                        <span class="text-red-500">{p.losses}</span>
                      </td>
                      <td class="py-3">
                        <div class="flex items-center gap-2">
                          <div class="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={`width:${rate}%`}></div>
                          </div>
                          <span class="text-xs text-slate-500 w-10">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {players.length === 0 && <div class="text-center py-8 text-slate-400">暂无数据</div>}
          </div>
        </Card>

        {/* Team rankings */}
        <Card title="🏅 队伍战绩排名">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-left text-slate-500">
                  <th class="py-3 font-semibold w-12">#</th>
                  <th class="py-3 font-semibold">队伍</th>
                  <th class="py-3 font-semibold">人数</th>
                  <th class="py-3 font-semibold">总胜场</th>
                  <th class="py-3 font-semibold">胜率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {teams.map((t, i) => {
                  const rate = t.total_played > 0 ? Math.round(t.total_wins / t.total_played * 100) : 0;
                  return (
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3">
                        {i < 3 ? (
                          <span class={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-amber-600'}`}>
                            {i + 1}
                          </span>
                        ) : (
                          <span class="text-slate-400 pl-2">{i + 1}</span>
                        )}
                      </td>
                      <td class="py-3 font-semibold text-slate-800">{t.name}</td>
                      <td class="py-3 text-slate-500">{t.players}</td>
                      <td class="py-3 text-emerald-600 font-medium">{t.total_wins}</td>
                      <td class="py-3">
                        <div class="flex items-center gap-2">
                          <div class="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={`width:${rate}%`}></div>
                          </div>
                          <span class="text-xs text-slate-500 w-10">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {teams.length === 0 && <div class="text-center py-8 text-slate-400">暂无数据</div>}
          </div>
        </Card>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
