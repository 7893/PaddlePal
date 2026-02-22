import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Group = {
  id: number;
  name: string;
  players: { player_id: number; position: number; seed: number; name: string; team: string }[];
};
type Player = { id: number; name: string; team: string; rating: number };

export const DrawManagePage: FC<{ eventKey: string; eventTitle: string; groups: Group[]; unassigned: Player[] }> = ({ eventKey, eventTitle, groups, unassigned }) => (
  <Layout title={`抽签管理 - ${eventTitle}`}>
    <Nav current="/admin" />
    <div class="max-w-6xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">🎲 抽签管理 - {eventTitle}</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      {/* 抽签控制 */}
      <Card title="抽签设置" class="mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">小组数</label>
            <select id="groupCount" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="2">2组</option>
              <option value="3">3组</option>
              <option value="4" selected>4组</option>
              <option value="5">5组</option>
              <option value="6">6组</option>
              <option value="8">8组</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">种子数</label>
            <select id="seedCount" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="0">无种子</option>
              <option value="2">2个种子</option>
              <option value="4" selected>4个种子</option>
              <option value="8">8个种子</option>
            </select>
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-2">
              <input type="checkbox" id="separateTeams" checked class="rounded border-gray-300" />
              <span class="text-sm text-gray-600">同队分开</span>
            </label>
          </div>
          <div class="flex items-end gap-2">
            <button onclick="executeDraw()" class="flex-1 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">执行抽签</button>
            <button onclick="resetDraw()" class="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">重置</button>
          </div>
        </div>
      </Card>

      {/* 分组结果 */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {groups.map(g => (
          <Card title={`${g.name}组`} class="min-h-[200px]">
            <div class="space-y-1">
              {g.players.map((p, i) => (
                <div class={`flex items-center justify-between px-2 py-1 rounded ${p.seed ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <span class="text-sm">
                    <span class="text-gray-400 mr-1">{i + 1}.</span>
                    {p.name}
                    {p.seed > 0 && <span class="text-yellow-600 text-xs ml-1">★</span>}
                  </span>
                  <span class="text-xs text-gray-400">{p.team}</span>
                </div>
              ))}
              {g.players.length === 0 && <div class="text-gray-400 text-sm text-center py-4">空</div>}
            </div>
          </Card>
        ))}
      </div>

      {/* 待抽选手 */}
      {unassigned.length > 0 && (
        <Card title={`待分配选手 (${unassigned.length}人)`}>
          <div class="flex flex-wrap gap-2">
            {unassigned.map(p => (
              <span class="px-2 py-1 bg-gray-100 rounded text-sm">
                {p.name} <span class="text-gray-400 text-xs">{p.team}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 统计 */}
      <div class="mt-4 text-sm text-gray-500 text-center">
        共 {groups.reduce((sum, g) => sum + g.players.length, 0) + unassigned.length} 人，
        已分配 {groups.reduce((sum, g) => sum + g.players.length, 0)} 人，
        待分配 {unassigned.length} 人
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

function executeDraw() {
  var groupCount = parseInt(document.getElementById('groupCount').value);
  var seedCount = parseInt(document.getElementById('seedCount').value);
  var separateTeams = document.getElementById('separateTeams').checked;

  if (!confirm('确定执行抽签？现有分组将被清除。')) return;

  api('/api/draw/roundrobin/' + eventKey + '/execute', {
    groupCount: groupCount,
    seedCount: seedCount,
    separateTeams: separateTeams
  }).then(function(res) {
    if (res.success) {
      alert('抽签完成！共 ' + res.totalPlayers + ' 人分入 ' + res.groupCount + ' 组');
      location.reload();
    } else {
      alert('错误: ' + res.error);
    }
  });
}

function resetDraw() {
  if (!confirm('确定重置？所有分组将被清除。')) return;

  api('/api/draw/roundrobin/' + eventKey + '/reset', {}).then(function(res) {
    if (res.success) location.reload();
  });
}
`}} />
  </Layout>
);
