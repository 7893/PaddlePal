import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, EmptyState } from '../components/layout';
import { StatCard } from '../components/match';

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

  return (
    <Layout title="选手检录">
      <Nav current="/admin/checkin" title="选手检录" />
      <PageWrapper>
        <div class="grid grid-cols-2 gap-4 mb-8 max-w-md">
          <StatCard label="待检录" value={matches.length - ready} color="amber" />
          <StatCard label="已就绪" value={ready} color="emerald" />
        </div>

        {matches.length === 0 ? (
          <EmptyState icon="✨" title="暂无待检录比赛" />
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
                    {[
                      { name: m.p1, done: m.checkin1, side: 1 },
                      { name: m.p2, done: m.checkin2, side: 2 },
                    ].map((p) => (
                      <div
                        class={`p-4 rounded-xl border-2 cursor-pointer transition-all ${p.done ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                        onclick={`checkin(${m.id},${p.side})`}
                      >
                        <div class="font-semibold text-slate-800">{p.name}</div>
                        <div class="text-sm mt-2">
                          {p.done ? (
                            <span class="text-emerald-600">✅ 已检录</span>
                          ) : (
                            <span class="text-slate-400">点击检录</span>
                          )}
                        </div>
                      </div>
                    ))}
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
          __html: `function checkin(id,side){fetch('/api/checkin/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({side})}).then(r=>r.json()).then(res=>{if(res.success){if(res.bothReady)alert('双方已检录，比赛开始！');location.reload()}})}`,
        }}
      />
    </Layout>
  );
};
