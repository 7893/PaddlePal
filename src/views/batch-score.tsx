import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Match = { id: number; time: string; table_no: number; p1: string; p2: string; score1: number; score2: number };

export const BatchScorePage: FC<{ matches: Match[] }> = ({ matches }) => (
  <Layout title="批量录入">
    <Nav current="/admin" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">⚡ 批量比分录入</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      <Card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-gray-500">
                <th class="py-2 text-left">时间</th>
                <th class="py-2 text-left">球台</th>
                <th class="py-2 text-left">选手A</th>
                <th class="py-2 text-center w-20">比分</th>
                <th class="py-2 text-left">选手B</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {matches.map(m => (
                <tr data-id={m.id}>
                  <td class="py-2 text-gray-500">{m.time}</td>
                  <td class="py-2">{m.table_no}号</td>
                  <td class="py-2 font-medium">{m.p1}</td>
                  <td class="py-2">
                    <div class="flex items-center justify-center gap-1">
                      <input type="number" class="w-10 border border-gray-300 rounded px-1 py-0.5 text-center score1" min="0" max="9" value={m.score1 ?? ''} />
                      <span>:</span>
                      <input type="number" class="w-10 border border-gray-300 rounded px-1 py-0.5 text-center score2" min="0" max="9" value={m.score2 ?? ''} />
                    </div>
                  </td>
                  <td class="py-2 font-medium">{m.p2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex gap-2">
          <button onclick="saveAll()" class="px-4 py-2 bg-pp-600 text-white rounded-lg hover:bg-pp-700">保存全部</button>
          <button onclick="clearAll()" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">清空</button>
        </div>
      </Card>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
function saveAll() {
  var matches = [];
  document.querySelectorAll('tr[data-id]').forEach(function(row) {
    var id = parseInt(row.dataset.id);
    var s1 = parseInt(row.querySelector('.score1').value) || 0;
    var s2 = parseInt(row.querySelector('.score2').value) || 0;
    if (s1 > 0 || s2 > 0) {
      matches.push({ id: id, score1: s1, score2: s2 });
    }
  });

  if (matches.length === 0) { alert('没有需要保存的比分'); return; }

  fetch('/api/batch/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matches: matches })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) {
      alert('已保存 ' + res.count + ' 场比赛');
      location.reload();
    }
  });
}

function clearAll() {
  document.querySelectorAll('.score1, .score2').forEach(function(el) { el.value = ''; });
}
`}} />
  </Layout>
);
