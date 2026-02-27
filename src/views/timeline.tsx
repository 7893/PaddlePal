import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer } from '../components/layout';

type Match = {
  id: number; time: string; table_no: number; event: string;
  p1: string; p2: string; score: string; status: string;
};

export const TimelinePage: FC<{ matches: Match[]; date: string }> = ({ matches, date }) => {
  const byTime: Record<string, Match[]> = {};
  for (const m of matches) {
    const t = m.time || '00:00';
    if (!byTime[t]) byTime[t] = [];
    byTime[t].push(m);
  }
  const times = Object.keys(byTime).sort();

  return (
    <Layout title="赛事时间线">
      <Nav current="/timeline" title="赛事时间线" />
      <PageWrapper>
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <span class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium">{date}</span>
            <span class="text-slate-500">{matches.length} 场比赛</span>
          </div>

          <div class="relative">
            {/* Timeline line */}
            <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-slate-200"></div>

            <div class="space-y-8">
              {times.map(time => (
                <div class="relative pl-14">
                  {/* Time dot */}
                  <div class="absolute left-2.5 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Time label */}
                  <div class="text-lg font-bold text-emerald-600 mb-3">{time}</div>
                  
                  {/* Matches */}
                  <div class="space-y-3">
                    {byTime[time].map(m => (
                      <div class={`p-4 rounded-xl border-2 transition-all ${
                        m.status === 'playing' ? 'border-red-400 bg-red-50 shadow-lg shadow-red-500/10' :
                        m.status === 'finished' ? 'border-emerald-400 bg-emerald-50' :
                        'border-slate-200 bg-white hover:shadow-md'
                      }`}>
                        <div class="flex justify-between items-center mb-2">
                          <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">{m.table_no}号台</span>
                          <span class="text-sm text-slate-400">{m.event}</span>
                          {m.status === 'playing' && (
                            <span class="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                              <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                              进行中
                            </span>
                          )}
                        </div>
                        <div class="font-semibold text-slate-800">
                          {m.p1} <span class="text-slate-400 mx-2">vs</span> {m.p2}
                          {m.score && <span class="ml-3 text-emerald-600 font-bold">{m.score}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {times.length === 0 && (
              <div class="text-center py-12 text-slate-400">
                <div class="text-4xl mb-3 opacity-50">📅</div>
                <p>暂无比赛安排</p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </Layout>
  );
};
