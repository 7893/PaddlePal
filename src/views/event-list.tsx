import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type Event = { id: number; key: string; title: string; type: string; stage: string; playerCount: number; matchCount: number; finished: number };

export const EventListPage: FC<{ events: Event[] }> = ({ events }) => (
  <Layout title="比赛项目">
    <Nav current="/results" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-6">🏆 比赛项目</h2>

      <div class="grid gap-4">
        {events.map(e => {
          const progress = e.matchCount > 0 ? Math.round(e.finished / e.matchCount * 100) : 0;
          return (
            <div class="bg-white border border-gray-200 rounded-xl p-4 hover:border-pp-300 transition-colors">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-bold text-gray-800">{e.title}</h3>
                  <div class="text-sm text-gray-500">{e.type} · {e.stage === 'loop' ? '循环赛' : '淘汰赛'}</div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-pp-600">{e.playerCount}</div>
                  <div class="text-xs text-gray-400">参赛人数</div>
                </div>
              </div>
              
              <div class="flex items-center gap-2 mb-3">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" style={`width:${progress}%`}></div>
                </div>
                <span class="text-xs text-gray-500">{e.finished}/{e.matchCount}</span>
              </div>

              <div class="flex gap-2">
                {e.stage === 'loop' ? (
                  <a href={`/standings/${e.key}`} class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">积分榜</a>
                ) : (
                  <a href={`/bracket/${e.key}`} class="px-3 py-1.5 bg-purple-50 text-purple-600 rounded text-sm hover:bg-purple-100">对阵图</a>
                )}
                <a href={`/results/${e.key}`} class="px-3 py-1.5 bg-gray-50 text-gray-600 rounded text-sm hover:bg-gray-100">成绩</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </Layout>
);
