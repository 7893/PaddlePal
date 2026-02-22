import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

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
    <Nav current="/admin" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">📜 操作日志</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      <Card>
        <div class="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map(log => (
            <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg text-sm">
              <div class={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                log.action === 'create' ? 'bg-green-500' :
                log.action === 'update' ? 'bg-blue-500' :
                log.action === 'delete' ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                {log.action === 'create' ? '+' : log.action === 'update' ? '✎' : log.action === 'delete' ? '×' : '•'}
              </div>
              <div class="flex-1">
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">{log.user_name || '系统'}</span>
                  <span class="text-xs text-gray-400">{log.created_at?.slice(0, 16)}</span>
                </div>
                <div class="text-gray-600">
                  {log.action === 'create' && '创建'}
                  {log.action === 'update' && '更新'}
                  {log.action === 'delete' && '删除'}
                  {' '}{log.target_type} #{log.target_id}
                </div>
                {log.details && <div class="text-gray-400 text-xs mt-1">{log.details}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </Layout>
);
