import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Badge, EmptyState } from '../components/layout';

type Log = {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  user_name: string;
  details: string;
  created_at: string;
};

const ActionIcon: FC<{ action: string }> = ({ action }) => {
  const styles: Record<string, string> = {
    create: 'bg-emerald-500',
    update: 'bg-blue-500',
    delete: 'bg-red-500',
  };
  const icons: Record<string, string> = { create: '+', update: '✎', delete: '×' };
  return (
    <div
      class={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${styles[action] || 'bg-slate-500'}`}
    >
      {icons[action] || '•'}
    </div>
  );
};

const ActionBadge: FC<{ action: string }> = ({ action }) => {
  const labels: Record<string, string> = { create: '创建', update: '更新', delete: '删除' };
  const colors: Record<string, string> = { create: 'green', update: 'blue', delete: 'red' };
  return <Badge color={colors[action] || 'gray'}>{labels[action] || action}</Badge>;
};

export const AuditLogPage: FC<{ logs: Log[] }> = ({ logs }) => (
  <Layout title="操作日志">
    <Nav current="/admin/logs" title="操作日志" />
    <PageWrapper>
      <Card>
        {logs.length > 0 ? (
          <div class="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div class="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
                <ActionIcon action={log.action} />
                <div class="flex-1">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-slate-800">{log.user_name || '系统'}</span>
                    <span class="text-sm text-slate-400">{log.created_at?.slice(0, 16)}</span>
                  </div>
                  <div class="text-slate-600 mt-1">
                    <ActionBadge action={log.action} />
                    <span class="ml-2">
                      {log.target_type} #{log.target_id}
                    </span>
                  </div>
                  {log.details && <div class="text-slate-400 text-sm mt-1">{log.details}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📜" title="暂无操作日志" />
        )}
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);
