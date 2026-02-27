import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer, Badge } from '../components/layout';

type Event = { id: number; key: string; title: string; type: string; stage: string; playerCount: number; matchCount: number; finished: number };

export const EventListPage: FC<{ events: Event[] }> = ({ events }) => (
  <Layout title="比赛项目">
    <Nav current="/events" title="比赛项目" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <div class="grid gap-5">
          {events.map(e => {
            const progress = e.matchCount > 0 ? Math.round(e.finished / e.matchCount * 100) : 0;
            const isComplete = e.finished === e.matchCount && e.matchCount > 0;
            return (
              <div class="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-slate-800 mb-1">{e.title}</h3>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-slate-500">{e.type}</span>
                      <Badge color={e.stage === 'loop' ? 'blue' : 'yellow'}>
                        {e.stage === 'loop' ? '循环赛' : '淘汰赛'}
                      </Badge>
                      {isComplete && <Badge color="green">已完赛</Badge>}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-emerald-600">{e.playerCount}</div>
                    <div class="text-sm text-slate-400">参赛人数</div>
                  </div>
                </div>
                
                <div class="flex items-center gap-3 mb-4">
                  <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all" style={`width:${progress}%`}></div>
                  </div>
                  <span class="text-sm text-slate-500 font-medium">{e.finished}/{e.matchCount}</span>
                </div>

                <div class="flex gap-3">
                  {e.stage === 'loop' ? (
                    <a href={`/standings/${e.key}`} class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">📊 积分榜</a>
                  ) : (
                    <a href={`/bracket/${e.key}`} class="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">🏆 对阵图</a>
                  )}
                  <a href={`/results/${e.key}`} class="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">📋 成绩</a>
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div class="text-5xl mb-4 opacity-50">🏆</div>
              <p class="text-slate-400">暂无比赛项目</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
