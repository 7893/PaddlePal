import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge } from '../components/layout';

type Match = {
  id: number; tb: number; tm: string; gp: string; ev: string;
  nl: string; nr: string; tnl: string; tnr: string;
  result: string; score: { l: number; r: number }[];
};

export const LivePage: FC<{ playing: Match[]; upcoming: Match[] }> = ({ playing, upcoming }) => (
  <Layout title="实时比分">
    <Nav current="/live" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">🔴 正在进行</h2>
      {playing.length === 0 ? (
        <div class="text-center py-12 text-gray-400 mb-8">当前没有正在进行的比赛</div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {playing.map(m => (
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-400">{m.gp} · {m.tb}号台</span>
                <Badge color="red">进行中</Badge>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-center flex-1">
                  <div class="font-bold text-gray-800">{m.nl}</div>
                  <div class="text-xs text-gray-400">{m.tnl}</div>
                </div>
                <div class="px-4">
                  <div class="text-2xl font-bold text-gray-800">
                    {m.score.filter(s => s.l > s.r).length} - {m.score.filter(s => s.r > s.l).length}
                  </div>
                  <div class="text-xs text-gray-400 text-center">
                    {m.score.map(s => `${s.l}:${s.r}`).join(' ')}
                  </div>
                </div>
                <div class="text-center flex-1">
                  <div class="font-bold text-gray-800">{m.nr}</div>
                  <div class="text-xs text-gray-400">{m.tnr}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 class="text-lg font-bold text-gray-800 mb-4">⏳ 即将开始</h2>
      {upcoming.length === 0 ? (
        <div class="text-center py-12 text-gray-400">没有待进行的比赛</div>
      ) : (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-gray-500 font-medium">时间</th>
                <th class="px-4 py-2 text-left text-gray-500 font-medium">球台</th>
                <th class="px-4 py-2 text-left text-gray-500 font-medium">选手</th>
                <th class="px-4 py-2 text-left text-gray-500 font-medium">项目</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {upcoming.map(m => (
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-gray-600">{m.tm}</td>
                  <td class="px-4 py-2 text-gray-600">{m.tb}号</td>
                  <td class="px-4 py-2">
                    <span class="font-medium text-gray-800">{m.nl}</span>
                    <span class="text-gray-400 mx-1">vs</span>
                    <span class="font-medium text-gray-800">{m.nr}</span>
                  </td>
                  <td class="px-4 py-2 text-gray-500">{m.gp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <script dangerouslySetInnerHTML={{
      __html: `setInterval(()=>location.reload(), 15000);`
    }} />
  </Layout>
);
