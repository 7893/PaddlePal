import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer } from '../components/layout';

type TableStatus = {
  no: number;
  status: 'idle' | 'playing' | 'ready';
  match?: { p1: string; p2: string; score1: number; score2: number; event: string };
};

export const TableStatusPage: FC<{ tables: TableStatus[] }> = ({ tables }) => {
  const playing = tables.filter((t) => t.status === 'playing').length;
  const ready = tables.filter((t) => t.status === 'ready').length;

  return (
    <Layout title="球台状态">
      <Nav current="/tables" title="球台状态" />
      <PageWrapper>
        {/* Stats */}
        <div class="grid grid-cols-3 gap-4 mb-8 max-w-lg">
          <div class="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-red-500/25">
            <div class="text-3xl font-bold">{playing}</div>
            <div class="text-sm text-red-100 mt-1">比赛中</div>
          </div>
          <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-center text-white shadow-lg shadow-amber-500/25">
            <div class="text-3xl font-bold">{ready}</div>
            <div class="text-sm text-amber-100 mt-1">待开始</div>
          </div>
          <div class="bg-white rounded-2xl p-5 text-center border border-slate-200">
            <div class="text-3xl font-bold text-slate-800">{tables.length - playing - ready}</div>
            <div class="text-sm text-slate-500 mt-1">空闲</div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <span class="text-slate-500">共 {tables.length} 张球台</span>
          <span class="text-sm text-slate-400" id="time"></span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((t) => (
            <div
              class={`rounded-2xl p-5 border-2 transition-all ${
                t.status === 'playing'
                  ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg'
                  : t.status === 'ready'
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50'
                    : 'border-slate-200 bg-white hover:shadow-md'
              }`}
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-xl font-bold text-slate-800">{t.no}号台</span>
                <span
                  class={`px-3 py-1 rounded-full text-xs font-medium ${
                    t.status === 'playing'
                      ? 'bg-red-500 text-white'
                      : t.status === 'ready'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {t.status === 'playing' ? '● 比赛中' : t.status === 'ready' ? '待开始' : '空闲'}
                </span>
              </div>

              {t.match ? (
                <div>
                  <div class="text-sm text-slate-500 mb-2">{t.match.event}</div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium truncate flex-1">{t.match.p1}</span>
                    <span class="font-bold text-lg mx-3 text-slate-800">
                      {t.match.score1}:{t.match.score2}
                    </span>
                    <span class="text-sm font-medium truncate flex-1 text-right">{t.match.p2}</span>
                  </div>
                </div>
              ) : (
                <div class="text-center text-slate-400 py-4">
                  <div class="text-2xl mb-1 opacity-50">🏓</div>
                  <div class="text-sm">暂无比赛</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </PageWrapper>
      <Footer />

      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.getElementById('time').textContent = '更新: ' + new Date().toLocaleTimeString();
        setInterval(function() { location.reload(); }, 30000);
      `,
        }}
      />
    </Layout>
  );
};
