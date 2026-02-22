import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Match = {
  id: number;
  pid: number;
  round: number;
  time: string;
  table_no: number;
  p1: string;
  p2: string;
  status: string;
};

export const ScheduleManagePage: FC<{ eventKey: string; eventTitle: string; matches: Match[]; tableCount: number }> = ({ eventKey, eventTitle, matches, tableCount }) => {
  // 按时间分组
  const byTime: Record<string, Match[]> = {};
  for (const m of matches) {
    if (!byTime[m.time]) byTime[m.time] = [];
    byTime[m.time].push(m);
  }
  const times = Object.keys(byTime).sort();

  return (
    <Layout title={`赛程编排 - ${eventTitle}`}>
      <Nav current="/admin" />
      <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-800">📅 赛程编排 - {eventTitle}</h2>
          <a href="/admin/draw" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
        </div>

        {/* 编排控制 */}
        <Card title="生成赛程" class="mb-4">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">球台数</label>
              <select id="tableCount" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="4">4台</option>
                <option value="6" selected>6台</option>
                <option value="8">8台</option>
                <option value="10">10台</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">开始时间</label>
              <input type="time" id="startTime" value="08:30" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">每场分钟</label>
              <select id="minutesPerMatch" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="10">10分钟</option>
                <option value="15" selected>15分钟</option>
                <option value="20">20分钟</option>
                <option value="30">30分钟</option>
              </select>
            </div>
            <div class="flex items-end gap-2">
              <button onclick="generateRoundRobin()" class="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">循环赛</button>
              <button onclick="generateKnockout()" class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">淘汰赛</button>
            </div>
            <div class="flex items-end">
              <button onclick="clearSchedule()" class="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">清除</button>
            </div>
          </div>
        </Card>

        {/* 赛程表格 */}
        {matches.length > 0 ? (
          <Card title={`赛程表 (${matches.length}场)`}>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left py-2 px-2 text-gray-500 font-medium">时间</th>
                    {Array.from({ length: tableCount }, (_, i) => (
                      <th class="text-center py-2 px-2 text-gray-500 font-medium">{i + 1}台</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map(time => (
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="py-2 px-2 font-mono text-gray-600">{time}</td>
                      {Array.from({ length: tableCount }, (_, i) => {
                        const match = byTime[time]?.find(m => m.table_no === i + 1);
                        return (
                          <td class="py-2 px-2 text-center">
                            {match ? (
                              <div class={`text-xs rounded px-1 py-0.5 ${match.status === 'finished' ? 'bg-green-100 text-green-700' : match.status === 'playing' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                {match.p1 || '?'} vs {match.p2 || '?'}
                              </div>
                            ) : (
                              <span class="text-gray-300">-</span>
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
          <Card>
            <div class="text-center py-8 text-gray-400">
              <div class="text-4xl mb-2">📅</div>
              <div>暂无赛程，请先生成</div>
            </div>
          </Card>
        )}

        <div class="mt-4 text-sm text-gray-500 text-center">
          共 {matches.length} 场比赛
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
var eventKey = '${eventKey}';

function api(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

function generateRoundRobin() {
  var tableCount = parseInt(document.getElementById('tableCount').value);
  var startTime = document.getElementById('startTime').value;
  var minutesPerMatch = parseInt(document.getElementById('minutesPerMatch').value);

  if (!confirm('生成循环赛赛程？现有赛程将被清除。')) return;

  api('/api/schedule/' + eventKey + '/roundrobin', {
    tableCount: tableCount,
    startTime: startTime,
    minutesPerMatch: minutesPerMatch
  }).then(function(res) {
    if (res.success) {
      alert('生成完成！共 ' + res.matchCount + ' 场比赛');
      location.reload();
    } else {
      alert('错误: ' + res.error);
    }
  });
}

function generateKnockout() {
  var playerCount = prompt('请输入参赛人数:', '8');
  if (!playerCount) return;

  var tableCount = parseInt(document.getElementById('tableCount').value);
  var startTime = document.getElementById('startTime').value;
  var minutesPerMatch = parseInt(document.getElementById('minutesPerMatch').value);

  api('/api/schedule/' + eventKey + '/knockout', {
    playerCount: parseInt(playerCount),
    tableCount: tableCount,
    startTime: startTime,
    minutesPerMatch: minutesPerMatch
  }).then(function(res) {
    if (res.success) {
      alert('生成完成！共 ' + res.matchCount + ' 场比赛，' + res.rounds + ' 轮');
      location.reload();
    } else {
      alert('错误: ' + res.error);
    }
  });
}

function clearSchedule() {
  if (!confirm('确定清除所有赛程？')) return;

  api('/api/schedule/' + eventKey + '/clear', {}).then(function(res) {
    if (res.success) location.reload();
  });
}
`}} />
    </Layout>
  );
};
