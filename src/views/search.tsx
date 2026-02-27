import type { FC } from 'hono/jsx';
import { Layout, Nav, Badge, Card, PageWrapper, Footer } from '../components/layout';

type Match = { pid: number; time: string; table_no: number; status: string; result: string; player1: string; player2: string; event: string };

export const SearchPage: FC<{ q: string; matches: Match[] }> = ({ q, matches }) => (
  <Layout title="查询">
    <Nav current="/search" title="赛程查询" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <form method="get" action="/search" class="flex gap-3 mb-8">
          <input name="q" value={q} placeholder="输入选手姓名..." class="flex-1 border border-slate-200 rounded-xl px-5 py-3 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" autofocus />
          <button type="submit" class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25">搜索</button>
        </form>

        {q && <div class="text-slate-500 mb-4">找到 {matches.length} 场比赛</div>}

        {matches.length > 0 && (
          <Card>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500">
                    <th class="py-3 text-left font-semibold w-16">场次</th>
                    <th class="py-3 text-left font-semibold">对阵</th>
                    <th class="py-3 text-left font-semibold">项目</th>
                    <th class="py-3 text-left font-semibold w-20">时间</th>
                    <th class="py-3 text-left font-semibold w-16">球台</th>
                    <th class="py-3 text-left font-semibold w-20">比分</th>
                    <th class="py-3 text-left font-semibold w-20">状态</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {matches.map(m => (
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3"><a href={`/score/${m.pid}`} class="text-emerald-600 hover:text-emerald-700 font-medium">{m.pid}</a></td>
                      <td class="py-3">
                        <span class="font-semibold text-slate-800">{m.player1}</span>
                        <span class="text-slate-400 mx-2">vs</span>
                        <span class="font-semibold text-slate-800">{m.player2}</span>
                      </td>
                      <td class="py-3 text-slate-500">{m.event}</td>
                      <td class="py-3 text-slate-600 font-medium">{m.time}</td>
                      <td class="py-3"><span class="px-2 py-1 bg-slate-100 rounded-lg text-slate-600">{m.table_no}号</span></td>
                      <td class="py-3 font-mono font-medium">{m.result || '-'}</td>
                      <td class="py-3">
                        <Badge color={m.status === 'finished' ? 'green' : m.status === 'playing' ? 'red' : 'gray'}>
                          {m.status === 'finished' ? '完赛' : m.status === 'playing' ? '进行中' : '待赛'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {q && matches.length === 0 && (
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-5xl mb-4 opacity-50">🔍</div>
            <p class="text-slate-400">未找到相关比赛</p>
          </div>
        )}
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
