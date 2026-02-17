import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type Player = { id: number; name: string; gender: string; team: string };

export const PlayersPage: FC<{ members: Player[] }> = ({ members }) => (
  <Layout title="选手">
    <Nav current="/players" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">👥 参赛选手 ({members.length})</h2>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-gray-500 font-medium">姓名</th>
              <th class="px-4 py-2 text-left text-gray-500 font-medium">性别</th>
              <th class="px-4 py-2 text-left text-gray-500 font-medium">队伍</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {members.map(p => (
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-2 font-medium text-gray-800">{p.name}</td>
                <td class="px-4 py-2 text-gray-600">{p.gender === 'M' ? '男' : p.gender === 'W' ? '女' : '混'}</td>
                <td class="px-4 py-2 text-gray-500">{p.team || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
);
