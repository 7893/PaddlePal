import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge } from '../components/layout';

type Match = {
  pid: number; time: string; table_no: number; status: string; result: string;
  player1: string; player2: string; event: string; date: string;
};

export const SchedulePage: FC<{ matches: Match[]; info: string }> = ({ matches, info }) => {
  const grouped = new Map<string, Match[]>();
  for (const m of matches) {
    const key = m.time || '未排';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(m);
  }
  return (
    <Layout title="赛程">
      <Nav current="/schedule" />
      <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
        <h2 class="text-lg font-bold text-gray-800 mb-4">📋 赛程表 · {info}</h2>
        <div class="text-sm text-gray-500 mb-4">共 {matches.length} 场比赛</div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">场次</th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">时间</th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium w-12">球台</th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium">对阵</th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium">项目</th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">比分</th>
                <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {matches.map(m => (
                <tr class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-gray-400 font-mono text-xs"><a href={`/score/${m.pid}`} class="text-pp-600 hover:underline">{m.pid}</a></td>
                  <td class="px-3 py-2 text-gray-600">{m.time}</td>
                  <td class="px-3 py-2 text-gray-600">{m.table_no}#</td>
                  <td class="px-3 py-2">
                    <span class={`font-medium ${m.result && m.result.indexOf(':') > 0 && parseInt(m.result) > parseInt(m.result.split(':')[1]) ? 'text-pp-700' : 'text-gray-800'}`}>{m.player1 || '待定'}</span>
                    <span class="text-gray-300 mx-1">vs</span>
                    <span class={`font-medium ${m.result && m.result.indexOf(':') > 0 && parseInt(m.result.split(':')[1]) > parseInt(m.result) ? 'text-pp-700' : 'text-gray-800'}`}>{m.player2 || '待定'}</span>
                  </td>
                  <td class="px-3 py-2 text-gray-500 text-xs">{m.event}</td>
                  <td class="px-3 py-2 font-mono text-gray-700">{m.result || '-'}</td>
                  <td class="px-3 py-2">
                    <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                      {m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行' : '待赛'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
