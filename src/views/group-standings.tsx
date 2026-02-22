import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Entry = { pos: number; name: string; played: number; wins: number; losses: number; gf: number; ga: number; points: number };

export const GroupStandings: FC<{ title: string; groups: { name: string; entries: Entry[] }[] }> = ({ title, groups }) => (
  <Layout title={`小组积分 - ${title}`}>
    <Nav current="/results" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-6">📊 {title} - 小组积分榜</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(g => (
          <Card title={g.name}>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 text-gray-500">
                  <th class="py-2 text-left">#</th>
                  <th class="py-2 text-left">选手</th>
                  <th class="py-2 text-center">场</th>
                  <th class="py-2 text-center">胜</th>
                  <th class="py-2 text-center">负</th>
                  <th class="py-2 text-center">局</th>
                  <th class="py-2 text-center font-bold">分</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                {g.entries.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga)).map((e, i) => (
                  <tr class={i < 2 ? 'bg-green-50' : ''}>
                    <td class="py-2 text-gray-400">{i + 1}</td>
                    <td class="py-2 font-medium">{e.name}</td>
                    <td class="py-2 text-center text-gray-600">{e.played}</td>
                    <td class="py-2 text-center text-green-600">{e.wins}</td>
                    <td class="py-2 text-center text-red-600">{e.losses}</td>
                    <td class="py-2 text-center text-gray-500 text-xs">{e.gf}:{e.ga}</td>
                    <td class="py-2 text-center font-bold text-pp-600">{e.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      <div class="mt-4 text-sm text-gray-500 text-center">
        <span class="inline-block w-3 h-3 bg-green-100 rounded mr-1"></span> 晋级区
      </div>
    </div>
  </Layout>
);
