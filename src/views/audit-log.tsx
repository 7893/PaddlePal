import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Log = {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  user_name: string;
  details: string;
  created_at: string;
};

export const AuditLogPage: FC<{ logs: Log[] }> = ({ logs }) => (
  <Layout title="操作日志">
    <Nav current="/admin/logs" title="操作日志" />
    <PageWrapper>
      <Card>
        <div class="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map((log) => (
            <div class="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
              <div
                class={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  log.action === 'create'
                    ? 'bg-emerald-500'
                    : log.action === 'update'
                      ? 'bg-blue-500'
                      : log.action === 'delete'
                        ? 'bg-red-500'
                        : 'bg-slate-500'
                }`}
              >
                {log.action === 'create' ? '+' : log.action === 'update' ? '✎' : log.action === 'delete' ? '×' : '•'}
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-slate-800">{log.user_name || '系统'}</span>
                  <span class="text-sm text-slate-400">{log.created_at?.slice(0, 16)}</span>
                </div>
                <div class="text-slate-600 mt-1">
                  <span
                    class={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.action === 'create'
                        ? 'bg-emerald-100 text-emerald-700'
                        : log.action === 'update'
                          ? 'bg-blue-100 text-blue-700'
                          : log.action === 'delete'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.action === 'create'
                      ? '创建'
                      : log.action === 'update'
                        ? '更新'
                        : log.action === 'delete'
                          ? '删除'
                          : log.action}
                  </span>
                  <span class="ml-2">
                    {log.target_type} #{log.target_id}
                  </span>
                </div>
                {log.details && <div class="text-slate-400 text-sm mt-1">{log.details}</div>}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div class="text-center py-12 text-slate-400">
              <div class="text-4xl mb-3 opacity-50">📜</div>
              <p>暂无操作日志</p>
            </div>
          )}
        </div>
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);
