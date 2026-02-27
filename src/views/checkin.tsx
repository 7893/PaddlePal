import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Match = {
  id: number;
  time: string;
  table_no: number;
  event: string;
  p1: string;
  p2: string;
  checkin1: number;
  checkin2: number;
};

export const CheckinPage: FC<{ matches: Match[] }> = ({ matches }) => {
  const ready = matches.filter((m) => m.checkin1 && m.checkin2).length;
  const pending = matches.length - ready;

  return (
    <Layout title="选手检录">
      <Nav current="/admin/checkin" title="选手检录" />
      <PageWrapper>
        {/* Stats */}
        <div class="grid grid-cols-2 gap-4 mb-8 max-w-md">
          <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-amber-500/25">
            <div class="text-3xl font-bold">{pending}</div>
            <div class="text-sm text-amber-100 mt-1">待检录</div>
          </div>
          <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-emerald-500/25">
            <div class="text-3xl font-bold">{ready}</div>
            <div class="text-sm text-emerald-100 mt-1">已就绪</div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-5xl mb-4 opacity-50">✨</div>
            <p class="text-slate-400">暂无待检录比赛</p>
          </div>
        ) : (
          <Card title={`待检录比赛 (${matches.length})`}>
            <div class="space-y-4">
              {matches.map((m) => (
                <div class="p-5 bg-slate-50 rounded-xl" data-id={m.id}>
                  <div class="flex justify-between items-center mb-4">
                    <span class="font-mono text-emerald-600 font-semibold">{m.time}</span>
                    <span class="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-sm">
                      {m.table_no}号台 · {m.event}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div
                      class={`p-4 rounded-xl border-2 cursor-pointer transition-all ${m.checkin1 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'}`}
                      onclick={`checkin(${m.id}, 1)`}
                    >
                      <div class="font-semibold text-slate-800">{m.p1}</div>
                      <div class="text-sm mt-2">
                        {m.checkin1 ? (
                          <span class="text-emerald-600">✅ 已检录</span>
                        ) : (
                          <span class="text-slate-400">点击检录</span>
                        )}
                      </div>
                    </div>
                    <div
                      class={`p-4 rounded-xl border-2 cursor-pointer transition-all ${m.checkin2 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'}`}
                      onclick={`checkin(${m.id}, 2)`}
                    >
                      <div class="font-semibold text-slate-800">{m.p2}</div>
                      <div class="text-sm mt-2">
                        {m.checkin2 ? (
                          <span class="text-emerald-600">✅ 已检录</span>
                        ) : (
                          <span class="text-slate-400">点击检录</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </PageWrapper>
      <Footer />

      <script
        dangerouslySetInnerHTML={{
          __html: `
function checkin(matchId, side) {
  fetch('/api/checkin/' + matchId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ side }) })
    .then(r => r.json()).then(res => { if (res.success) { if (res.bothReady) alert('双方已检录，比赛开始！'); location.reload(); } });
}
`,
        }}
      />
    </Layout>
  );
};
