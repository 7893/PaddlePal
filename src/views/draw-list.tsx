import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge, PageWrapper, Footer } from '../components/layout';

type EventItem = {
  id: number; key: string; title: string; type: string;
  format: string; player_count: number; match_count: number;
};

export const DrawListPage: FC<{ events: EventItem[] }> = ({ events }) => (
  <Layout title="抽签编排">
    <Nav current="/admin/draw" title="抽签编排" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <Card>
          {events.length > 0 ? (
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500">
                    <th class="py-3 text-left font-semibold">项目</th>
                    <th class="py-3 text-left font-semibold">类型</th>
                    <th class="py-3 text-left font-semibold">赛制</th>
                    <th class="py-3 text-center font-semibold">已生成</th>
                    <th class="py-3 text-right font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {events.map((e) => (
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-4 font-semibold text-slate-800">{e.title}</td>
                      <td class="py-4">
                        <Badge color={e.type === 'singles' ? 'blue' : e.type === 'doubles' ? 'green' : 'yellow'}>
                          {e.type === 'singles' ? '单打' : e.type === 'doubles' ? '双打' : '团体'}
                        </Badge>
                      </td>
                      <td class="py-4 text-slate-500">
                        {e.format === 'knockout' ? '淘汰赛' : e.format === 'roundrobin' ? '循环赛' : '小组+淘汰'}
                      </td>
                      <td class="py-4 text-center">
                        {e.match_count > 0 ? (
                          <span class="text-emerald-600 font-semibold">{e.match_count} 场</span>
                        ) : (
                          <span class="text-slate-400">-</span>
                        )}
                      </td>
                      <td class="py-4 text-right space-x-2">
                        <a href={`/admin/draw/roundrobin/${e.key}`} class="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">分组</a>
                        <a href={`/admin/schedule/${e.key}`} class="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">编排</a>
                        <a href={`/admin/draw/${e.id}`} class="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">淘汰</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="text-center py-12">
              <div class="text-5xl mb-4 opacity-50">🎲</div>
              <p class="text-slate-500 mb-2">暂无项目</p>
              <p class="text-slate-400 text-sm">请先在项目管理中添加比赛项目</p>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
