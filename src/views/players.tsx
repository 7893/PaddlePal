import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Player = { id: number; name: string; gender: string; team: string };

export const PlayersPage: FC<{ members: Player[] }> = ({ members }) => (
  <Layout title="选手">
    <Nav current="/players" title={`参赛选手 (${members.length})`} />
    <PageWrapper>
      <Card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500">
                <th class="py-3 text-left font-semibold">姓名</th>
                <th class="py-3 text-left font-semibold">性别</th>
                <th class="py-3 text-left font-semibold">队伍</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {members.map(p => (
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3">
                    <a href={`/player/${p.id}`} class="font-semibold text-slate-800 hover:text-emerald-600">{p.name}</a>
                  </td>
                  <td class="py-3">
                    <span class={`px-2 py-1 rounded-lg text-xs font-medium ${p.gender === 'M' ? 'bg-blue-100 text-blue-700' : p.gender === 'W' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-600'}`}>
                      {p.gender === 'M' ? '男' : p.gender === 'W' ? '女' : '混'}
                    </span>
                  </td>
                  <td class="py-3 text-slate-500">{p.team || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && <div class="text-center py-12 text-slate-400">暂无选手</div>}
        </div>
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);
