import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Appeal = {
  id: number; match_id: number; match_order: number; player_name: string;
  reason: string; status: string; created_at: string; resolution: string;
};

export const AppealsPage: FC<{ appeals: Appeal[]; canResolve: boolean }> = ({ appeals, canResolve }) => {
  const pending = appeals.filter(a => a.status === 'pending');
  const resolved = appeals.filter(a => a.status !== 'pending');

  return (
    <Layout title="申诉管理">
      <Nav current="/admin/appeals" title="申诉管理" />
      <PageWrapper>
        {/* Stats */}
        <div class="grid grid-cols-2 gap-4 mb-8 max-w-md">
          <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-amber-500/25">
            <div class="text-3xl font-bold">{pending.length}</div>
            <div class="text-sm text-amber-100 mt-1">待处理</div>
          </div>
          <div class="bg-white rounded-2xl p-5 text-center border border-slate-200">
            <div class="text-3xl font-bold text-slate-800">{resolved.length}</div>
            <div class="text-sm text-slate-500 mt-1">已处理</div>
          </div>
        </div>

        {pending.length > 0 && (
          <Card title={`待处理 (${pending.length})`} class="mb-6">
            <div class="space-y-4">
              {pending.map(a => (
                <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl" data-id={a.id}>
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <span class="px-3 py-1 bg-amber-200 text-amber-800 rounded-lg text-sm font-medium">场次 #{a.match_order}</span>
                      {a.player_name && <span class="ml-2 font-semibold text-slate-800">{a.player_name}</span>}
                    </div>
                    <span class="text-sm text-slate-400">{a.created_at?.slice(0, 16)}</span>
                  </div>
                  <p class="text-slate-700 mb-4">{a.reason}</p>
                  {canResolve && (
                    <div class="flex gap-3">
                      <button onclick={`resolve(${a.id}, 'approved')`} class="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">✓ 通过</button>
                      <button onclick={`resolve(${a.id}, 'rejected')`} class="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">✗ 驳回</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {resolved.length > 0 && (
          <Card title={`已处理 (${resolved.length})`}>
            <div class="space-y-3">
              {resolved.map(a => (
                <div class="p-4 bg-slate-50 rounded-xl">
                  <div class="flex justify-between items-center">
                    <div>
                      <span class="text-slate-500">场次 #{a.match_order}</span>
                      <span class="mx-2">·</span>
                      <span class="font-medium text-slate-700">{a.player_name || '匿名'}</span>
                    </div>
                    <span class={`px-3 py-1 rounded-lg text-sm font-medium ${a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {a.status === 'approved' ? '✓ 通过' : '✗ 驳回'}
                    </span>
                  </div>
                  {a.resolution && <p class="text-slate-500 mt-2 text-sm">{a.resolution}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {appeals.length === 0 && (
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-5xl mb-4 opacity-50">✨</div>
            <p class="text-slate-400">暂无申诉</p>
          </div>
        )}
      </PageWrapper>
      <Footer />

      <script dangerouslySetInnerHTML={{ __html: `
function resolve(id, status) {
  var resolution = prompt(status === 'approved' ? '处理意见（可选）:' : '驳回理由:');
  if (status === 'rejected' && !resolution) return;
  fetch('/api/appeals/' + id + '/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, resolution: resolution || '' }) })
    .then(r => r.json()).then(res => { if (res.success) location.reload(); });
}
`}} />
    </Layout>
  );
};
