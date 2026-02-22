import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Appeal = {
  id: number;
  match_id: number;
  match_order: number;
  player_name: string;
  reason: string;
  status: string;
  created_at: string;
  resolution: string;
};

export const AppealsPage: FC<{ appeals: Appeal[]; canResolve: boolean }> = ({ appeals, canResolve }) => {
  const pending = appeals.filter(a => a.status === 'pending');
  const resolved = appeals.filter(a => a.status !== 'pending');

  return (
    <Layout title="申诉管理">
      <Nav current="/admin" />
      <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">📝 申诉管理</h2>
          <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
        </div>

        {pending.length > 0 && (
          <Card title={`待处理 (${pending.length})`} class="mb-4">
            <div class="space-y-3">
              {pending.map(a => (
                <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-id={a.id}>
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <span class="text-sm text-gray-500">场次 #{a.match_order}</span>
                      {a.player_name && <span class="ml-2 text-sm font-medium">{a.player_name}</span>}
                    </div>
                    <span class="text-xs text-gray-400">{a.created_at?.slice(0, 16)}</span>
                  </div>
                  <p class="text-gray-700 mb-3">{a.reason}</p>
                  {canResolve && (
                    <div class="flex gap-2">
                      <button onclick={`resolve(${a.id}, 'approved')`} class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">通过</button>
                      <button onclick={`resolve(${a.id}, 'rejected')`} class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">驳回</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {resolved.length > 0 && (
          <Card title={`已处理 (${resolved.length})`}>
            <div class="space-y-2">
              {resolved.map(a => (
                <div class="p-3 bg-gray-50 rounded-lg text-sm">
                  <div class="flex justify-between">
                    <span>场次 #{a.match_order} - {a.player_name || '匿名'}</span>
                    <span class={a.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                      {a.status === 'approved' ? '✓ 通过' : '✗ 驳回'}
                    </span>
                  </div>
                  {a.resolution && <p class="text-gray-500 mt-1">{a.resolution}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {appeals.length === 0 && (
          <Card>
            <div class="text-center py-8 text-gray-400">
              <div class="text-4xl mb-2">✨</div>
              <div>暂无申诉</div>
            </div>
          </Card>
        )}
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
function resolve(id, status) {
  var resolution = prompt(status === 'approved' ? '处理意见（可选）:' : '驳回理由:');
  if (status === 'rejected' && !resolution) return;

  fetch('/api/appeals/' + id + '/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: status, resolution: resolution || '' })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) location.reload();
  });
}
`}} />
    </Layout>
  );
};
