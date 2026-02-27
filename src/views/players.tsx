import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Badge } from '../components/layout';

type Player = { id: number; name: string; gender: string; team: string };

const GenderBadge: FC<{ gender: string }> = ({ gender }) => {
  const map: Record<string, { color: string; text: string }> = {
    M: { color: 'blue', text: '男' },
    W: { color: 'red', text: '女' },
  };
  const g = map[gender] || { color: 'gray', text: '混' };
  return <Badge color={g.color}>{g.text}</Badge>;
};

export const PlayersPage: FC<{ members: Player[] }> = ({ members }) => (
  <Layout title="选手">
    <Nav current="/players" title={`参赛选手 (${members.length})`} />
    <PageWrapper>
      <Card>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500">
              <th class="py-3 text-left font-semibold">姓名</th>
              <th class="py-3 text-left font-semibold">性别</th>
              <th class="py-3 text-left font-semibold">队伍</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {members.map((p) => (
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3">
                  <a href={`/player/${p.id}`} class="font-semibold text-slate-800 hover:text-emerald-600">
                    {p.name}
                  </a>
                </td>
                <td class="py-3">
                  <GenderBadge gender={p.gender} />
                </td>
                <td class="py-3 text-slate-500">{p.team || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <div class="text-center py-12 text-slate-400">暂无选手</div>}
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);
