import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, Badge, Table, Th, Td, PageHeader, EmptyState } from '../components/layout';

type EventItem = {
  id: number;
  key: string;
  title: string;
  type: string;
  format: string;
  player_count: number;
  match_count: number;
};

export const DrawListPage: FC<{ events: EventItem[] }> = ({ events }) => (
  <Layout title="抽签编排">
    <Nav current="/admin/draw" />
    <div class="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 fade-in">
      <PageHeader title="抽签编排" subtitle="选择项目进行抽签和对阵生成" />
      
      <Card hover={false}>
        {events.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>项目</Th>
                <Th>类型</Th>
                <Th>赛制</Th>
                <Th class="text-center">已生成</Th>
                <Th class="text-right">操作</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <Td class="font-medium text-slate-800">{e.title}</Td>
                  <Td>
                    <Badge color={e.type === 'singles' ? 'blue' : e.type === 'doubles' ? 'green' : 'yellow'}>
                      {e.type === 'singles' ? '单打' : e.type === 'doubles' ? '双打' : '团体'}
                    </Badge>
                  </Td>
                  <Td class="text-slate-500 text-sm">
                    {e.format === 'knockout' ? '淘汰赛' : e.format === 'roundrobin' ? '循环赛' : '小组+淘汰'}
                  </Td>
                  <Td class="text-center">
                    {e.match_count > 0 ? (
                      <span class="text-pp-600 font-medium">{e.match_count} 场</span>
                    ) : (
                      <span class="text-slate-400">-</span>
                    )}
                  </Td>
                  <Td class="text-right space-x-2">
                    <a href={`/admin/draw/roundrobin/${e.key}`} class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors">
                      分组
                    </a>
                    <a href={`/admin/schedule/${e.key}`} class="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded transition-colors">
                      编排
                    </a>
                    <a href={`/admin/draw/${e.id}`} class="inline-flex items-center px-2 py-1 text-xs font-medium text-pp-600 hover:bg-pp-50 rounded transition-colors">
                      淘汰
                    </a>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="🎲" title="暂无项目" description="请先在项目管理中添加比赛项目" />
        )}
      </Card>
    </div>
  </Layout>
);
