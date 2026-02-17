import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type Match = { pid: number; time: string; table_no: number; status: string; result: string; player1: string; player2: string; event: string };

export const SearchPage: FC<{ q: string; matches: Match[] }> = ({ q, matches }) => (
  <Layout title="查询">
    <Nav current="/schedule" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4">🔍 赛程查询</h2>
      <form method="get" action="/search" class="flex gap-2 mb-6">
        <input name="q" value={q} placeholder="输入选手姓名" class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pp-500" autofocus />
        <button type="submit" class="px-6 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">搜索</button>
      </form>
      {q && <div class="text-sm text-gray-500 mb-3">找到 {matches.length} 场比赛</div>}
      {matches.length > 0 && (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50"><tr>
              <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">场次</th>
              <th class="px-3 py-2 text-left text-gray-500 font-medium">对阵</th>
              <th class="px-3 py-2 text-left text-gray-500 font-medium">项目</th>
              <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">时间</th>
              <th class="px-3 py-2 text-left text-gray-500 font-medium w-12">球台</th>
              <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">比分</th>
              <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">状态</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
              {matches.map(m => (
                <tr class="hover:bg-gray-50">
                  <td class="px-3 py-2"><a href={`/score/${m.pid}`} class="text-pp-600 hover:underline font-mono text-xs">{m.pid}</a></td>
                  <td class="px-3 py-2"><span class="font-medium">{m.player1}</span> <span class="text-gray-300">vs</span> <span class="font-medium">{m.player2}</span></td>
                  <td class="px-3 py-2 text-gray-500 text-xs">{m.event}</td>
                  <td class="px-3 py-2 text-gray-600">{m.time}</td>
                  <td class="px-3 py-2 text-gray-600">{m.table_no}#</td>
                  <td class="px-3 py-2 font-mono">{m.result || '-'}</td>
                  <td class="px-3 py-2"><Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>{m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行' : '待赛'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </Layout>
);
