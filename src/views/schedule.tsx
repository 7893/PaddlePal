import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge, PageWrapper, Footer } from '../components/layout';

type Match = {
  pid: number;
  time: string;
  table_no: number;
  status: string;
  result: string;
  player1: string;
  player2: string;
  event: string;
  date: string;
};

export const SchedulePage: FC<{ matches: Match[]; info: string }> = ({ matches, info: _info }) => {
  const finished = matches.filter((m) => m.status === 'finished').length;
  const playing = matches.filter((m) => m.status === 'playing').length;
  return (
    <Layout title="赛程">
      <Nav current="/schedule" title="赛程安排" />
      <PageWrapper>
        {/* Stats */}
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-slate-800">{matches.length}</div>
            <div class="text-sm text-slate-500 mt-1">总场次</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-emerald-600">{finished}</div>
            <div class="text-sm text-slate-500 mt-1">已完赛</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-200 text-center">
            <div class="text-3xl font-bold text-red-500">{playing}</div>
            <div class="text-sm text-slate-500 mt-1">进行中</div>
          </div>
        </div>

        {/* Table */}
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold w-20">场次</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold w-24">时间</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold w-20">球台</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold">对阵</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold">项目</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold w-24">比分</th>
                <th class="px-5 py-4 text-left text-slate-600 font-semibold w-24">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {matches.map((m) => (
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4">
                    <a href={`/score/${m.pid}`} class="text-emerald-600 hover:text-emerald-700 font-medium">
                      {m.pid}
                    </a>
                  </td>
                  <td class="px-5 py-4 text-slate-600 font-medium">{m.time || '-'}</td>
                  <td class="px-5 py-4">
                    <span class="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">{m.table_no}号</span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class={`font-semibold ${m.result && parseInt(m.result) > parseInt(m.result.split(':')[1] || '0') ? 'text-emerald-600' : 'text-slate-800'}`}
                    >
                      {m.player1 || '待定'}
                    </span>
                    <span class="text-slate-400 mx-2">vs</span>
                    <span
                      class={`font-semibold ${m.result && parseInt(m.result.split(':')[1] || '0') > parseInt(m.result) ? 'text-emerald-600' : 'text-slate-800'}`}
                    >
                      {m.player2 || '待定'}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-slate-500">{m.event}</td>
                  <td class="px-5 py-4 font-mono text-slate-700 font-medium">{m.result || '-'}</td>
                  <td class="px-5 py-4">
                    <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                      {m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行中' : '待赛'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && (
            <div class="text-center py-12 text-slate-400">
              <div class="text-4xl mb-3 opacity-50">📅</div>
              <p>暂无赛程安排</p>
            </div>
          )}
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
