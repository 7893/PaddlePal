import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type Match = {
  id: number;
  time: string;
  table_no: number;
  event: string;
  p1: string;
  p2: string;
  score: string;
  status: string;
};

export const TimelinePage: FC<{ matches: Match[]; date: string }> = ({ matches, date }) => {
  // 按时间分组
  const byTime: Record<string, Match[]> = {};
  for (const m of matches) {
    const t = m.time || '00:00';
    if (!byTime[t]) byTime[t] = [];
    byTime[t].push(m);
  }
  const times = Object.keys(byTime).sort();

  return (
    <Layout title="赛事时间线">
      <Nav current="/schedule" />
      <div class="max-w-3xl mx-auto px-4 py-6 fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">📅 赛事时间线</h2>
          <span class="text-sm text-gray-500">{date}</span>
        </div>

        <div class="relative">
          {/* 时间线 */}
          <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div class="space-y-6">
            {times.map(time => (
              <div class="relative pl-12">
                {/* 时间点 */}
                <div class="absolute left-2 w-5 h-5 bg-pp-500 rounded-full border-4 border-white shadow"></div>
                
                {/* 时间标签 */}
                <div class="text-sm font-bold text-pp-600 mb-2">{time}</div>
                
                {/* 该时间的比赛 */}
                <div class="space-y-2">
                  {byTime[time].map(m => (
                    <div class={`p-3 rounded-lg border ${
                      m.status === 'playing' ? 'border-red-300 bg-red-50' :
                      m.status === 'finished' ? 'border-green-300 bg-green-50' :
                      'border-gray-200 bg-white'
                    }`}>
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500">{m.table_no}号台</span>
                        <span class="text-xs text-gray-400">{m.event}</span>
                      </div>
                      <div class="mt-1 font-medium">
                        {m.p1} <span class="text-gray-400">vs</span> {m.p2}
                        {m.score && <span class="ml-2 text-pp-600">{m.score}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
