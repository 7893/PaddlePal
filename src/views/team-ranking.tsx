import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Team = { id: number; name: string; players: number; wins: number; played: number };

export const TeamRankingPage: FC<{ teams: Team[] }> = ({ teams }) => (
  <Layout title="队伍排名">
    <Nav current="/ranking" />
    <div class="max-w-3xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-6">🏅 队伍排名</h2>

      <Card>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500">
              <th class="py-3 text-left">#</th>
              <th class="py-3 text-left">队伍</th>
              <th class="py-3 text-center">人数</th>
              <th class="py-3 text-center">总胜场</th>
              <th class="py-3 text-center">总场次</th>
              <th class="py-3 text-center">胜率</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {teams.map((t, i) => {
              const rate = t.played > 0 ? Math.round(t.wins / t.played * 100) : 0;
              return (
                <tr class="hover:bg-gray-50">
                  <td class="py-3">
                    {i < 3 ? (
                      <span class={`w-6 h-6 rounded-full inline-flex items-center justify-center text-white text-xs ${
                        i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>{i + 1}</span>
                    ) : (
                      <span class="text-gray-400 pl-2">{i + 1}</span>
                    )}
                  </td>
                  <td class="py-3 font-medium">{t.name}</td>
                  <td class="py-3 text-center text-gray-500">{t.players}</td>
                  <td class="py-3 text-center text-green-600 font-medium">{t.wins}</td>
                  <td class="py-3 text-center text-gray-500">{t.played}</td>
                  <td class="py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-pp-500 rounded-full" style={`width:${rate}%`}></div>
                      </div>
                      <span class="text-xs text-gray-500 w-10">{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  </Layout>
);
