import type { FC } from 'hono/jsx';
import { Layout, Nav } from '../components/layout';

type TableStatus = { no: number; status: 'idle' | 'playing' | 'ready'; match?: { p1: string; p2: string; score1: number; score2: number; event: string } };

export const TableStatusPage: FC<{ tables: TableStatus[] }> = ({ tables }) => (
  <Layout title="球台状态">
    <Nav current="/live" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">🏓 球台状态</h2>
        <span class="text-sm text-gray-500" id="time"></span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tables.map(t => (
          <div class={`rounded-xl p-4 border-2 ${
            t.status === 'playing' ? 'border-red-400 bg-red-50' :
            t.status === 'ready' ? 'border-yellow-400 bg-yellow-50' :
            'border-gray-200 bg-white'
          }`}>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl font-bold">{t.no}号台</span>
              <span class={`px-2 py-0.5 rounded-full text-xs ${
                t.status === 'playing' ? 'bg-red-500 text-white' :
                t.status === 'ready' ? 'bg-yellow-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {t.status === 'playing' ? '比赛中' : t.status === 'ready' ? '待开始' : '空闲'}
              </span>
            </div>
            
            {t.match ? (
              <div>
                <div class="text-xs text-gray-500 mb-1">{t.match.event}</div>
                <div class="flex items-center justify-between">
                  <span class="text-sm truncate flex-1">{t.match.p1}</span>
                  <span class="font-bold mx-2">{t.match.score1}:{t.match.score2}</span>
                  <span class="text-sm truncate flex-1 text-right">{t.match.p2}</span>
                </div>
              </div>
            ) : (
              <div class="text-center text-gray-400 py-2">暂无比赛</div>
            )}
          </div>
        ))}
      </div>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
      document.getElementById('time').textContent = new Date().toLocaleTimeString();
      setInterval(function() { location.reload(); }, 30000);
    `}} />
  </Layout>
);
