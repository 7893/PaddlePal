import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Match = {
  id: number;
  match_order: number;
  time: string;
  event: string;
  p1: string;
  p2: string;
  score1: number;
  score2: number;
  games: string;
};

export const ConfirmPage: FC<{ matches: Match[]; userRole: string }> = ({ matches, userRole }) => {
  const isReferee = userRole === 'referee' || userRole === 'deputy_referee';

  return (
    <Layout title="成绩确认">
      <Nav current="/admin/confirm" title="成绩确认" />
      <PageWrapper>
        {!isReferee ? (
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-5xl mb-4 opacity-50">🔒</div>
            <p class="text-slate-500">仅裁判长/副裁判长可确认成绩</p>
          </div>
        ) : matches.length === 0 ? (
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-5xl mb-4 opacity-50">✨</div>
            <p class="text-slate-400">暂无待确认成绩</p>
          </div>
        ) : (
          <>
            <div class="flex items-center justify-between mb-6">
              <span class="text-slate-500">共 {matches.length} 场待确认</span>
              <button
                onclick="confirmAll()"
                class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25"
              >
                全部确认
              </button>
            </div>
            <Card>
              <div class="space-y-3">
                {matches.map((m) => (
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl" data-id={m.id}>
                    <div class="flex-1">
                      <div class="text-sm text-slate-500 mb-1">
                        {m.event} · {m.time}
                      </div>
                      <div class="font-semibold text-lg">
                        <span class={m.score1 > m.score2 ? 'text-emerald-600' : 'text-slate-800'}>{m.p1}</span>
                        <span class="mx-3 text-slate-400">
                          {m.score1} : {m.score2}
                        </span>
                        <span class={m.score2 > m.score1 ? 'text-emerald-600' : 'text-slate-800'}>{m.p2}</span>
                      </div>
                      {m.games && <div class="text-sm text-slate-400 mt-1">{m.games}</div>}
                    </div>
                    <div class="flex gap-3">
                      <button
                        onclick={`confirmOne(${m.id})`}
                        class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors"
                      >
                        ✓ 确认
                      </button>
                      <a
                        href={`/score/${m.id}`}
                        class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        修改
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </PageWrapper>
      <Footer />

      <script
        dangerouslySetInnerHTML={{
          __html: `
function confirmOne(id) {
  fetch('/api/confirm/' + id, { method: 'POST' }).then(r => r.json()).then(res => {
    if (res.success) document.querySelector('[data-id="' + id + '"]').remove();
    else alert('错误: ' + res.error);
  });
}
function confirmAll() {
  var ids = Array.from(document.querySelectorAll('[data-id]')).map(el => parseInt(el.dataset.id));
  if (!ids.length) return;
  if (!confirm('确认全部 ' + ids.length + ' 场比赛成绩？')) return;
  fetch('/api/confirm/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchIds: ids }) })
    .then(r => r.json()).then(res => { if (res.success) location.reload(); else alert('错误: ' + res.error); });
}
`,
        }}
      />
    </Layout>
  );
};
