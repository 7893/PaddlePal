import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

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

export const CheckinPage: FC<{ matches: Match[] }> = ({ matches }) => (
  <Layout title="选手检录">
    <Nav current="/admin" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">📋 选手检录</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      {matches.length === 0 ? (
        <Card>
          <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-2">✨</div>
            <div>暂无待检录比赛</div>
          </div>
        </Card>
      ) : (
        <Card title={`待检录 (${matches.length})`}>
          <div class="space-y-3">
            {matches.map(m => (
              <div class="p-4 bg-gray-50 rounded-lg" data-id={m.id}>
                <div class="flex justify-between items-center mb-2">
                  <span class="font-mono text-pp-600">{m.time}</span>
                  <span class="text-sm text-gray-400">{m.table_no}号台 · {m.event}</span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class={`p-3 rounded-lg border-2 cursor-pointer transition-all ${m.checkin1 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-pp-300'}`} onclick={`checkin(${m.id}, 1)`}>
                    <div class="font-medium">{m.p1}</div>
                    <div class="text-xs mt-1">{m.checkin1 ? '✅ 已检录' : '点击检录'}</div>
                  </div>
                  <div class={`p-3 rounded-lg border-2 cursor-pointer transition-all ${m.checkin2 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-pp-300'}`} onclick={`checkin(${m.id}, 2)`}>
                    <div class="font-medium">{m.p2}</div>
                    <div class="text-xs mt-1">{m.checkin2 ? '✅ 已检录' : '点击检录'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
function checkin(matchId, side) {
  fetch('/api/checkin/' + matchId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ side: side })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) {
      if (res.bothReady) {
        alert('双方已检录，比赛开始！');
      }
      location.reload();
    }
  });
}
`}} />
  </Layout>
);
