import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type PlayerStat = {
  id: number;
  name: string;
  team: string;
  played: number;
  wins: number;
  losses: number;
  games_won: number;
  games_lost: number;
};

type TeamStat = {
  name: string;
  players: number;
  total_played: number;
  total_wins: number;
};

export const StatsPage: FC<{ players: PlayerStat[]; teams: TeamStat[] }> = ({ players, teams }) => (
  <Layout title="统计报表">
    <Nav current="/stats" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-6">📊 统计报表</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 选手排名 */}
        <Card title="选手战绩排名">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-left text-gray-500">
                <th class="py-2">#</th>
                <th class="py-2">选手</th>
                <th class="py-2">队伍</th>
                <th class="py-2">胜/负</th>
                <th class="py-2">胜率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {players.slice(0, 20).map((p, i) => {
                const rate = p.played > 0 ? Math.round(p.wins / p.played * 100) : 0;
                return (
                  <tr class="hover:bg-gray-50">
                    <td class="py-2 text-gray-400">{i + 1}</td>
                    <td class="py-2 font-medium">{p.name}</td>
                    <td class="py-2 text-gray-500 text-xs">{p.team || '-'}</td>
                    <td class="py-2">
                      <span class="text-green-600">{p.wins}</span>
                      <span class="text-gray-400">/</span>
                      <span class="text-red-600">{p.losses}</span>
                    </td>
                    <td class="py-2">
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div class="h-full bg-green-500 rounded-full" style={`width:${rate}%`}></div>
                        </div>
                        <span class="text-xs text-gray-500">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* 队伍排名 */}
        <Card title="队伍战绩排名">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-left text-gray-500">
                <th class="py-2">#</th>
                <th class="py-2">队伍</th>
                <th class="py-2">人数</th>
                <th class="py-2">总胜场</th>
                <th class="py-2">胜率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {teams.map((t, i) => {
                const rate = t.total_played > 0 ? Math.round(t.total_wins / t.total_played * 100) : 0;
                return (
                  <tr class="hover:bg-gray-50">
                    <td class="py-2 text-gray-400">{i + 1}</td>
                    <td class="py-2 font-medium">{t.name}</td>
                    <td class="py-2 text-gray-500">{t.players}</td>
                    <td class="py-2 text-green-600">{t.total_wins}</td>
                    <td class="py-2">
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div class="h-full bg-blue-500 rounded-full" style={`width:${rate}%`}></div>
                        </div>
                        <span class="text-xs text-gray-500">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  </Layout>
);
