import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

type Match = {
  id: number; pid: number; round: number; time: string;
  table_no: number; p1: string; p2: string; status: string;
};

export const ScheduleManagePage: FC<{ eventKey: string; eventTitle: string; matches: Match[]; tableCount: number }> = ({ eventKey, eventTitle, matches, tableCount }) => {
  const byTime: Record<string, Match[]> = {};
  for (const m of matches) {
    if (!byTime[m.time]) byTime[m.time] = [];
    byTime[m.time].push(m);
  }
  const times = Object.keys(byTime).sort();

  return (
    <Layout title={`赛程编排 - ${eventTitle}`}>
      <Nav current="/admin/schedule" title={`赛程编排 · ${eventTitle}`} />
      <PageWrapper>
        {/* Controls */}
        <Card title="生成赛程" class="mb-6">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">球台数</label>
              <select id="tableCount" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500">
                {[4, 6, 8, 10, 12].map(n => <option value={n} selected={n === 6}>{n}台</option>)}
              </select>
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">开始时间</label>
              <input type="time" id="startTime" value="08:30" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-2 font-medium">每场分钟</label>
              <select id="minutesPerMatch" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500">
                {[10, 15, 20, 25, 30].map(n => <option value={n} selected={n === 15}>{n}分钟</option>)}
              </select>
            </div>
            <div class="flex items-end gap-2">
              <button onclick="generateRoundRobin()" class="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">循环赛</button>
              <button onclick="generateKnockout()" class="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">淘汰赛</button>
            </div>
            <div class="flex items-end">
              <button onclick="clearSchedule()" class="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50">清除</button>
            </div>
          </div>
        </Card>

        {/* Schedule table */}
        {matches.length > 0 ? (
          <Card title={`赛程表 (${matches.length}场)`}>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-3 px-3 text-slate-500 font-semibold">时间</th>
                    {Array.from({ length: tableCount }, (_, i) => (
                      <th class="text-center py-3 px-3 text-slate-500 font-semibold">{i + 1}台</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map(time => (
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td class="py-3 px-3 font-mono text-slate-600 font-medium">{time}</td>
                      {Array.from({ length: tableCount }, (_, i) => {
                        const match = byTime[time]?.find(m => m.table_no === i + 1);
                        return (
                          <td class="py-3 px-3 text-center">
                            {match ? (
                              <div class={`text-xs rounded-lg px-2 py-1.5 ${match.status === 'finished' ? 'bg-emerald-100 text-emerald-700' : match.status === 'playing' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {match.p1 || '?'} vs {match.p2 || '?'}
                              </div>
                            ) : (
                              <span class="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div class="text-5xl mb-4 opacity-50">📅</div>
            <p class="text-slate-400">暂无赛程，请先生成</p>
          </div>
        )}

        <div class="mt-6 text-center text-slate-500">共 {matches.length} 场比赛</div>
      </PageWrapper>
      <Footer />

      <script dangerouslySetInnerHTML={{ __html: `
var eventKey = '${eventKey}';
function api(url, body) { return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()); }
function generateRoundRobin() {
  if (!confirm('生成循环赛赛程？现有赛程将被清除。')) return;
  api('/api/schedule/' + eventKey + '/roundrobin', {
    tableCount: parseInt(document.getElementById('tableCount').value),
    startTime: document.getElementById('startTime').value,
    minutesPerMatch: parseInt(document.getElementById('minutesPerMatch').value)
  }).then(res => { if (res.success) { alert('生成完成！共 ' + res.matchCount + ' 场比赛'); location.reload(); } else alert('错误: ' + res.error); });
}
function generateKnockout() {
  var playerCount = prompt('请输入参赛人数:', '8');
  if (!playerCount) return;
  api('/api/schedule/' + eventKey + '/knockout', {
    playerCount: parseInt(playerCount),
    tableCount: parseInt(document.getElementById('tableCount').value),
    startTime: document.getElementById('startTime').value,
    minutesPerMatch: parseInt(document.getElementById('minutesPerMatch').value)
  }).then(res => { if (res.success) { alert('生成完成！共 ' + res.matchCount + ' 场比赛'); location.reload(); } else alert('错误: ' + res.error); });
}
function clearSchedule() { if (!confirm('确定清除所有赛程？')) return; api('/api/schedule/' + eventKey + '/clear', {}).then(res => { if (res.success) location.reload(); }); }
`}} />
    </Layout>
  );
};
